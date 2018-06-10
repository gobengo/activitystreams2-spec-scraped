# activitystreams2-spec-scraped

[![Build Status](https://travis-ci.com/gobengo/activitystreams2-spec-scraped.svg?branch=master)](https://travis-ci.com/gobengo/activitystreams2-spec-scraped)

Scrape data from the ActivityStreams 2.0 specs:
* https://www.w3.org/TR/activitystreams-core/
* https://www.w3.org/TR/activitystreams-vocabulary/

## Usage

### node.js/TypeScript

```javascript
import { scrapeVocabulary, vocabularySpecUrl } from "activitystreams2-spec-scraped"

(async () => {
  let v

  // This will load from a fixture and *will not* make an http request
  v = await scrapeVocabulary()

  // Provide a URL to fetch the html from there, then parse
  v = await scrapeVocabulary(vocabularySpecUrl)

  console.log(v)
})()
```

### Command Line Interface

* `npx activitystreams2-spec-scraped`
* `npm install -g activitystreams2-spec-scraped && activitystreams2-spec-scraped`
* Clone repo and `npm install && npm start`

The below output is truncated. See [./data/](./data/activitystreams-vocabulary/1528589057.json) for a full example.

```bash
$ npx activitystreams2-spec-scraped
{
  "activityTypes": [
    {
      "name": "Question",
      "notes": "Represents a question being asked. Question objects are an extension of IntransitiveActivity. That is, the Question object is an Activity, but the direct object is the question itself and therefore it would not contain an object property. Either of the anyOf and oneOf properties MAY be used to express possible answers, but a Question object MUST NOT have both properties.",
      "subClassOf": {
        "name": "IntransitiveActivity",
        "href": "https://www.w3.org/TR/activitystreams-vocabulary/#dfn-intransitiveactivity"
      },
      "id": "https://www.w3.org/ns/activitystreams#Question",
      "url": "https://www.w3.org/TR/activitystreams-vocabulary/#dfn-question",
      "example": [
        {
          "name": "Example 40",
          "uri": "https://www.w3.org/TR/activitystreams-vocabulary/#ex55a-jsonld",
          "object": {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Question",
            "name": "What is the answer?",
            "oneOf": [
              {
                "type": "Note",
                "name": "Option A"
              },
              {
                "type": "Note",
                "name": "Option B"
              }
            ]
          }
        },
        {
          "name": "Example 41",
          "uri": "https://www.w3.org/TR/activitystreams-vocabulary/#ex55b-jsonld",
          "object": {
            "@context": "https://www.w3.org/ns/activitystreams",
            "type": "Question",
            "name": "What is the answer?",
            "closed": "2016-05-10T00:00:00Z"
          }
        }
      ]
    }
  ],
  "properties": [
    {
      "name": "actor",
      "id": "https://www.w3.org/ns/activitystreams#actor",
      "url": "https://www.w3.org/TR/activitystreams-vocabulary/#dfn-actor",
      "notes": "Describes one or more entities that either performed or are expected to perform the activity. Any single activity can have multiple actors. The actor MAY be specified using an indirect Link.",
      "example": [
        {
          "name": "Example 63",
          "uri": "https://www.w3.org/TR/activitystreams-vocabulary/#ex59-jsonld",
          "object": {
            "@context": "https://www.w3.org/ns/activitystreams",
            "summary": "Sally offered the Foo object",
            "type": "Offer",
            "actor": "http://sally.example.org",
            "object": "http://example.org/foo"
          }
        }
      ],
      "domain": [
        {
          "name": "Activity",
          "url": "https://www.w3.org/TR/activitystreams-vocabulary/#dfn-activity"
        }
      ],
      "range": [
        {
          "name": "Object",
          "url": "https://www.w3.org/TR/activitystreams-vocabulary/#dfn-object"
        },
        {
          "name": "Link",
          "url": "https://www.w3.org/TR/activitystreams-vocabulary/#dfn-link"
        }
      ],
      "functional": false,
      "subPropertyOf": {
        "name": "attributedTo",
        "url": "https://www.w3.org/TR/activitystreams-vocabulary/#dfn-attributedto"
      }
    }
  ]
}
```
