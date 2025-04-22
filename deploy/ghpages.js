// place at : deploy/ghpages.js
// you can see more info at https://github.com/tschaub/gh-pages
import { fileURLToPath } from 'url';
import path from 'path';
import ghpages from 'gh-pages';

const options = {
    branch: 'gh-pages',
    repo: 'https://github.com/redfire29/whack-a-momiji.git' // project github repo
};

const callback = err => {

    if (err) console.error(err);
    else console.log('publish success');
};

// 模擬 __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * This task pushes to the `master` branch of the configured `repo`.
 */
ghpages.publish(path.resolve(__dirname, '../dist'), options, callback);