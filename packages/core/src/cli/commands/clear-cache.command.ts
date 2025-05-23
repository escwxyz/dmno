import kleur from 'kleur';
import * as _ from 'lodash-es';
import { outdent } from 'outdent';

import { DmnoCommand } from '../lib/dmno-command';
import { getCliRunCtx } from '../lib/cli-ctx';

const program = new DmnoCommand('clear-cache')
  .summary('cache utils')
  .description(outdent`
    Tools to clear / reset the cache

    Also note many commands have \`--skip-cache\` and \`--clear-cache\` flags
  `)
  .example('dmno clear-cache', 'Clear the entire cache');
  // .example('dmno cache clear -s web', 'Clear items from the cache used by the "web" service only');


// addServiceSelection(program);

program.action(async (opts, more) => {
  const ctx = getCliRunCtx();

  const {
    wasDeleted,
    cacheFilePath,
  } = await ctx.dmnoServer.makeRequest('clearCache');

  if (wasDeleted) {
    console.log('🧲💾 Workspace cache file erased');
    console.log(kleur.italic().gray(cacheFilePath));
    console.log();
  } else {
    console.log('👻 Workspace cache file already gone!\n');
    process.exit(0);
  }

  process.exit(0);
});

export const ClearCacheCommand = program;
