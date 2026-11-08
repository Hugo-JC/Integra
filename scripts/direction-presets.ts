import { matchDirectionPresets } from '../src/modules/direction/preset-catalog.js';
const query=process.argv.slice(2).join(' ').trim();
if(!query){console.error('Usage: npm run direction:presets -- "SaaS dashboard for developers"');process.exit(2);}
const matches=matchDirectionPresets(query,8);
if(!matches.length){console.log('No strong local preset match. Use the brief and existing product system to establish a direction.');process.exit(0);}
console.log(JSON.stringify(matches,null,2));
