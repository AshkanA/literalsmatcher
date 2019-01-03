const fs = require('fs');
const path = require('path');
const levenshtein = require('fast-levenshtein');
const config = require(path.join(__dirname, 'config.json'));
const literals = [];
const dictionary = {};
const matches = [];

function exportToCSV() {

  let data = 'Literal,Source,Match Name,Match ID,Match Alternate,Match Distance\n';

  for ( const item of matches ) {

    for ( const match of item.matches ) {

      data += `${item.literal.name},${item.literal.source},${match.name},${match.id},${match.alternate || ''},${match.distance}\n`

    }

  }

  fs.writeFileSync(path.join(__dirname, config.output), data);

}

function readLiterals() {

  const literalsLineReader = require('readline').createInterface({
    input: fs.createReadStream(path.join(__dirname, config.literals))
  });

  return new Promise((resolve, reject) => {

    literalsLineReader
    .on('line', (line) => {

      const splitted = line.split(',');

      literals.push({
        name: splitted[0].trim(),
        source: splitted[1].trim()
      });

    })
    .on('close', () => {

      resolve();

    })
    .on('error', (error) => {

      reject(error);

    });

  });

}

function readDictionary() {

  const dictionaryLineReader = require('readline').createInterface({
    input: fs.createReadStream(path.join(__dirname, config.dictionary))
  });

  return new Promise((resolve, reject) => {

    dictionaryLineReader
    .on('line', (line) => {

      const splitted = line.split(',');

      dictionary[splitted[0].trim()] = {
        name: splitted[1].trim(),
        alternate: splitted[2].trim() !== 'null' ? splitted[2].trim() : undefined
      };

    })
    .on('close', () => {

      resolve();

    })
    .on('error', (error) => {

      reject(error);

    });

  });

}

readLiterals()
.then(() => {

  return readDictionary();

})
.then(() => {

  console.log(`Read ${literals.length} literals and ${Object.keys(dictionary).length} names inside the dictionary.`);

  for ( const literal of literals ) {

    let currentMatches = [];

    for ( const id in dictionary ) {

      const distance = levenshtein.get(dictionary[id].name.toLowerCase(), literal.name.toLowerCase());

      if ( distance > config.tolerance ) continue;

      if ( distance === 0 ) {

        currentMatches = [{
          id: id,
          name: dictionary[id].name,
          alternate: dictionary[id].alternate,
          distance: distance
        }];

        continue;

      }

      currentMatches.push({
        id: id,
        name: dictionary[id].name,
        alternate: dictionary[id].alternate,
        distance: distance
      });

    }

    if ( currentMatches.length ) {

      matches.push({
        literal: literal,
        matches: currentMatches
      });

    }

  }

  console.log(`Found ${matches.length} matches...`);

  exportToCSV();

  console.log('Wrote to file matches.csv');

})
.catch(error => {

  console.log(error);

});
