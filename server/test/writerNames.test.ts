import { describe, expect, it } from 'vitest';
import { api, fresh, signUp } from './api.js';
import { noteWriterNames } from '../src/lookup/writerNames.js';

describe('a writer’s names', () => {
  it('are one writer’s, however they’re written, once found to be', async () => {
    const tag = fresh('w');
    const item = `Q${tag.replace(/\D/g, '') || '1'}9`;
    await noteWriterNames(item, [`Annie Ernaux ${tag}`, `Анни Эрно ${tag}`]);
    await noteWriterNames(`${item}0`, [`Someone Else ${tag}`]);
    const me = await signUp();
    const names = [`Анни Эрно ${tag}`, `Someone Else ${tag}`, 'Nobody'];
    const { groups } = (
      await api(
        `/lookup/writers/same?names=${encodeURIComponent(names.join('\n'))}`,
        { cookie: me.cookie },
      )
    ).body as { groups: string[][] };
    expect(groups.map((group) => group.sort())).toEqual([
      [`Annie Ernaux ${tag}`, `Анни Эрно ${tag}`].sort(),
    ]);
  });

  it('are known for the writers on the reader’s own shelves', async () => {
    const tag = fresh('m');
    const item = `Q${tag.replace(/\D/g, '') || '1'}8`;
    await noteWriterNames(item, [`Annie Ernaux ${tag}`, `Анни Эрно ${tag}`]);
    const me = await signUp();
    await api('/books', {
      method: 'POST',
      cookie: me.cookie,
      body: {
        title: 'Свое место',
        authors: [`Анни Эрно ${tag}`],
        copy: { status: 'shelf' },
      },
    });
    const { groups } = (
      await api('/lookup/writers/same/mine', { cookie: me.cookie })
    ).body as { groups: string[][] };
    expect(groups.map((group) => group.sort())).toEqual([
      [`Annie Ernaux ${tag}`, `Анни Эрно ${tag}`].sort(),
    ]);
  });
});
