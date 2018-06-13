
import {as2ContextUrl} from '../';

const {promises: jsonld} = require('jsonld');
const as2Context =
    require('../../data/w3.org/ns/activitystreams.jsonld/1528897748.json');

const offlineContexts = {
  [as2ContextUrl]: as2Context
};

export const createOfflineJsonldDocumentLoader =
    (fallbackLoader: (url: string, callback: Function) => void,
     contexts:
         {[key: string]: object}) => (url: string, callback: Function) => {
      if (url in contexts) {
        return callback(null, {
          contextUrl: null,  // this is for a context via a link header
          document:
              contexts[url],  // this is the actual document that was loaded
          documentUrl: url    // this is the actual context URL after redirects
        });
      }
      // call the underlining documentLoader using the callback API.
      return fallbackLoader(url, callback);
    };

export const createDefaultJsonldDocumentLoader = () =>
    createOfflineJsonldDocumentLoader(
        jsonld.documentLoaders.node(), offlineContexts);
