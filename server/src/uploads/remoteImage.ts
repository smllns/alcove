import { lookup } from 'node:dns/promises';
import { BlockList, isIP } from 'node:net';
import { HttpError } from '../lib/errors.js';
import { imageType } from './imageType.js';

// Fetching a picture from a link the reader pasted. The server does the
// fetching (most sites don't let a browser read their images), so it must
// not be talked into reaching anything private: only public addresses, a
// few redirects at most, a size cap, and the bytes must be a real image.

// Under Vercel's 4.5 MB response limit, with room to spare
const MAX_REMOTE_BYTES = 4 * 1024 * 1024;
const MAX_REDIRECTS = 3;

const privateRanges = new BlockList();
for (const [net, bits] of [
  ['0.0.0.0', 8],
  ['10.0.0.0', 8],
  ['100.64.0.0', 10],
  ['127.0.0.0', 8],
  ['169.254.0.0', 16],
  ['172.16.0.0', 12],
  ['192.0.0.0', 24],
  ['192.168.0.0', 16],
  ['198.18.0.0', 15],
  ['224.0.0.0', 3],
] as const)
  privateRanges.addSubnet(net, bits, 'ipv4');
privateRanges.addAddress('::', 'ipv6');
privateRanges.addAddress('::1', 'ipv6');
privateRanges.addSubnet('fc00::', 7, 'ipv6');
privateRanges.addSubnet('fe80::', 10, 'ipv6');

const isPrivate = (address: string) => {
  // An IPv4 address written the IPv6 way
  const v4 = address.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/i)?.[1];
  if (v4) return privateRanges.check(v4, 'ipv4');
  return privateRanges.check(address, isIP(address) === 6 ? 'ipv6' : 'ipv4');
};

const notAPicture = (message = 'That link doesn’t lead to a picture.') =>
  new HttpError(400, 'bad_image_link', message, { url: message });

async function checkAddress(url: URL) {
  if (url.protocol !== 'https:' && url.protocol !== 'http:')
    throw notAPicture('Paste a link that starts with http or https.');
  if (url.username || url.password) throw notAPicture();
  const host = url.hostname.replace(/^\[|\]$/g, '');
  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true }).catch(() => {
        throw notAPicture('That site can’t be found.');
      });
  if (addresses.some(({ address }) => isPrivate(address))) throw notAPicture();
}

// The response at `link`, following redirects by hand so each hop is checked
async function fetchPublic(link: string) {
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    throw notAPicture('That doesn’t look like a web link.');
  }
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await checkAddress(url);
    const res = await fetch(url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(10_000),
      headers: { Accept: 'image/*' },
    }).catch(() => {
      throw notAPicture('That site isn’t answering.');
    });
    const next = res.headers.get('location');
    if (res.status >= 300 && res.status < 400 && next) {
      url = new URL(next, url);
      continue;
    }
    if (!res.ok) throw notAPicture('That site wouldn’t give us the picture.');
    return res;
  }
  throw notAPicture();
}

// Reads the body, giving up as soon as it grows past the cap
async function readCapped(res: Response) {
  if (Number(res.headers.get('content-length') ?? 0) > MAX_REMOTE_BYTES)
    throw notAPicture('That picture is too big (over 4 MB).');
  const reader = res.body?.getReader();
  if (!reader) throw notAPicture();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > MAX_REMOTE_BYTES) {
      await reader.cancel();
      throw notAPicture('That picture is too big (over 4 MB).');
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks);
}

export async function fetchRemoteImage(link: string) {
  const bytes = await readCapped(await fetchPublic(link));
  const type = imageType(bytes);
  if (!type) throw notAPicture();
  return { bytes, type };
}
