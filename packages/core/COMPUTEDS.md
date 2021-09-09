# Computed values and dynamic relationships

- [Computed values and dynamic relationships](#computed-values-and-dynamic-relationships)
  - [Taxonomy of Fields](#taxonomy-of-fields)
  - [Prioritization](#prioritization)
    - [LinksTo\* Breakdown](#linksto-breakdown)
    - [Card Chooser UI as Motivating Use Case for Query System](#card-chooser-ui-as-motivating-use-case-for-query-system)
  - [Further API Design decisions](#further-api-design-decisions)
  - [Defered Features](#defered-features)
  - [Open Questions/Strings to pull](#open-questionsstrings-to-pull)

## Taxonomy of Fields

| Name         | Arity    | Value/Ref finds                  | Status                      |
| ------------ | -------- | -------------------------------- | --------------------------- |
| containsOne  | singular | value                            | implemented with basic UI   |
| containsMany | plural   | value                            | compiler implemented, no UI |
| linksToOne   | singular | reference via locally stored ID  |                             |
| linksToMany  | plural   | reference via locally stored IDs |                             |
| findsOne     | singular | reference via query              |                             |
| findsMany    | plural   | reference via query              |                             |

**Why we probably need to distinguish between "list of ids" and "query":**

- they support different mutations (to support mutation on query you would need spooky action at a distance)
- very different UI
- permissions are quite different depending on which side owns the data

**What is the separation between schema-layer concerns and data-layer concerns?**

- often, setting up a query is a schema-layer policy decision and then individual records shouldn't really change it
- this supports the idea that storing query vs storing IDs is a schema choice (as described in previous section)
- is there ever a need to manipulate queries at the data layer? (working theory: no, lets skip it for the present)

**choices on relationships**

- ordering / sorting (manual order is often important. Sometimes people will want an imposed ordering.)
- pagination / infinite scroll
- are individual viewers allowed to customize ordering or pagination?

**Doubly indirect relationships**

- the point of references is to use existing data, not make new copies
- but sometimes the existing data you want to reuse is itself a Collection
- "doubly indirect" because you first lookup the query and/or list of ids, and then use the ids to lookup the records
  - these may be two different things depending on whether you "first lookup the query" or "first lookup the list of ids"
- this can probably surface to users as some kind of first-class Collection concept
- is this a completely distinct type of relationship, or can you encode it as "plural referenced via query"

## Prioritization

- to do findsOne and findsMany we need to do query system
- to do query system we probably need to do indexing
- we could do linksToOne and linksToMany first
  - but the card chooser itself also needs query system (can stub at first)

### LinksTo\* Breakdown

See: [CS-1808](https://linear.app/cardstack/issue/CS-1808/linkstoone-fields)
See: [CS-1809](https://linear.app/cardstack/issue/CS-1809/linkstoone-fields)

- make syntax work in schema.js so you can declare these things
- write or update a create card tests for a card that has these things
- get a basic placeholder component into place in the edit view
  - offer to choose or create
  - create implies stack-like routing into the existing create-new-card experience
  - choose implies implementing a framework-provided card browser with type filtering capability
  - implementing chooser requires implementing queries
- related cards go into server response (they are json:api relationships with included resources)
  - does this imply query system? (no, it's not an arbitrary query, just IDs which we already support)
- client side deserializer needs to know how to take the json:api relationships and put them into our POJO structure that gets handed to the user's component

### Card Chooser UI as Motivating Use Case for Query System

See: [CS-77](https://linear.app/cardstack/issue/CS-77/basic-card-chooser)

- invoked with a Query that scopes down what you're searching for
- is kinda "modal" ish, maybe a tray that opens from the bottom
- can be launched with Query limiting to right type when the clicks "Choose an
  author..." button on the edit form of a card
  - (later could also be manually opened more like Finder, and support dragging cards into fields)
- is backed by searches, search is a new method on the cards service that takes a Query
- search method is implemented via new API endpoint(s) and/or query params on compiler-server
- the new API endpoints execute queries against the search index in postgres
- first we can implement single-pass at-startup index all the cards into postgres
  - then we can worry about incremental update and invalidations

## Further API Design decisions

We need to figure out the overlap of functionality between computeds and dynamic relationships. Are dynamic relationships just computeds with some extra sugar?

* Schema.js - How computed and relationships are declared
  - [ ] How will computeds be written?
  - [ ] Will any of the field inclusion types require special options?
* Components Templates - How computeds and relationships are invoked
  - [ ] The HBS api
  - [ ] What this actually does when compiled. Wrapper components?
* Arbitrary JS access to dynamic computed/relationship data
  - [ ] API for fetching missing relationships
  - [ ] WHat are the implications for client vs server side computeds?
* Modal stacking (ie: Open this post's author in edit view)
* Framework components for managing collections (ie: adding/removing ContainsMany/HasMany fields)
## Defered Features

- Caching/Index invalidation
- Pagination
- Declarative configuration of how data is loaded (ie: Dont load this Post's comments until the component is on screen)

## Open Questions/Strings to pull
- [ ] Polymorphic relationships?
- [ ] Consider blockchain transaction indexing - Hassan has knowledge
- [ ] Consider music registry examples - Burcu has knowledge
- [ ] Generate some basic prose on the design decisions for Chris to use in the community
- [ ] See "Doubly indirect relationships" info above

