#!/usr/bin/env node

import * as yargs from 'yargs';
import {getFiles} from './helpers';
import * as fs from 'fs';
import {Measurement} from './types';
import * as json2csv from 'json2csv';
import * as path from 'path';

interface Options {
    directory: string,
    filename: string
}
const args = yargs
    .alias('d', 'directory')
    .alias('f', 'filename')
    .argv as any as Options;

if(!args.directory) {
    throw('data directory not specified!')
}

console.log('arguments', args.directory)


let data = new Map<string, any[]>();

let files = getFiles(args.directory, '.json');

files.forEach(file => {
    let fileContent: Measurement = JSON.parse(fs.readFileSync(file).toString());
    if(data.get(fileContent.file)) {
        let tmp = data.get(fileContent.file);
        tmp.push(fileContent);
    } else {
        data.set(fileContent.file, [fileContent])
    }
});



let result = [...data.values()].map((measurements: Measurement[]) => {
return {
        file: path.basename(measurements[0].file),
        comment: measurements[0].fileStat.comment,
        source: measurements[0].fileStat.source,
        loc:  measurements[0].fileStat.comment + measurements[0].fileStat.source,
        duration_1: measurements[0].duration,
        duration_2: measurements[1].duration,
        duration_3: measurements[2].duration,
        duration_mean: getMeans(measurements)
    };

});

const field = ['file', 'loc', 'duration'];
const json2csvParser = new json2csv.Parser({field});
const csv = json2csvParser.parse(result);

const file = path.join(__dirname, args.filename);
console.log('write file ', file);
fs.writeFileSync(file, csv, { flag: "w+" });

function getMeans(measurements): number {
    let sum = 0;
    measurements.forEach(item => {
        sum += item.duration
    });

    return Math.round(sum / measurements.length);
}
