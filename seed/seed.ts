import 'dotenv/config'

import weaviate from 'weaviate-ts-client';
import { encode } from 'node-base64-image';
// @ts-ignore
import pokedex from './pokedex.json';

(async () => {
  const client = weaviate.client({
    scheme: process.env['WEAVIATE_SCHEME'] || '',
    host: process.env['WEAVIATE_HOST'] || '',
  });

  const schemaConfig = {
    class: 'Pokemon',
    vectorizer: 'img2vec-neural',
    vectorIndexType: 'hnsw',
    moduleConfig: {
      'img2vec-neural': {
        imageFields: [
          'sample'
        ]
      }
    },
    properties: [
      {
        name: 'biology',
        dataType: ['text']
      },
      {
        name: 'dexNumber',
        dataType: ['int']
      },
      {
        name: 'generation',
        dataType: ['int']
      },
      {
        name: 'image',
        dataType: ['text']
      },
      {
        name: 'name',
        dataType: ['text']
      },
      {
        name: 'typing',
        dataType: ['text[]']
      },
      {
        name: 'sample',
        dataType: ['blob']
      }
    ]
  }

  const classExists = await client.schema.exists('Pokemon');

  if (!classExists) {
    await client.schema
      .classCreator()
      .withClass(schemaConfig)
      .do();
  }

  for (let pokemon of pokedex) {
    for (let image of pokemon.samples) {
      const base64Image = (await encode(image)).toString('base64');
      const parsedPokemon = { ...pokemon };
      delete parsedPokemon.samples;

      await client.data.creator()
        .withClassName('Pokemon')
        .withProperties({ ...pokemon, sample: base64Image })
        .do();
    }
    console.log(`${((pokemon.dexNumber / pokedex[pokedex.length - 1].dexNumber) * 100).toFixed(2)}% - ${pokemon.name}`)
  }
})();
