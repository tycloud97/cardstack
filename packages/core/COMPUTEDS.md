# Computed values and dynamic relationships
- [Computed values and dynamic relationships](#computed-values-and-dynamic-relationships)
  - [API Design decisions](#api-design-decisions)
    - [Schema.js - How computed and relationships are declared](#schemajs---how-computed-and-relationships-are-declared)
    - [Components Templates - How computeds and relationships are invoked](#components-templates---how-computeds-and-relationships-are-invoked)
    - [Arbitrary JS access to dynamic computed/relationship data](#arbitrary-js-access-to-dynamic-computedrelationship-data)
    - [Modal stacking (ie: Open this post's author in edit view)](#modal-stacking-ie-open-this-posts-author-in-edit-view)
    - [Framework components for managing collections (ie: adding/removing ContainsMany/HasMany fields)](#framework-components-for-managing-collections-ie-addingremoving-containsmanyhasmany-fields)
  - [Defered Features](#defered-features)
  - [Open Questions/Strings to pull](#open-questionsstrings-to-pull)

## API Design decisions
We need to figure out the overlap of functionality between computeds and dynamic relationships. Are dynamic relationships just computeds with some extra sugar?
### Schema.js - How computed and relationships are declared
```js
import { contains, hasOne, hasMany, computed } from '@cardstack/types';
import string from 'https://cardstack.com/base/string';
import datetime from 'https://cardstack.com/base/datetime';
import comment from 'https://myserver.com/cards/comment';
import author from 'https://myserver.com/cards/author';

export default class Post {
  @contains(string)
  title;

  @contains(string)
  body;

  @contains(datetime)
  createdAt;

  // Relationship to a singular card
  @hasOne(person)
  author;

  // Relationship to a many cards of the same type
  @hasMany(comment)
  comment;

  @computed
  get relatedPosts() {
    return // ...
  }
}

```

### Components Templates - How computeds and relationships are invoked
- [ ] The HBS api
- [ ] What this actually does when compiled. Wrapper components?
### Arbitrary JS access to dynamic computed/relationship data
- [ ] API for fetching missing relationships
- [ ] WHat are the implications for client vs server side computeds?
### Modal stacking (ie: Open this post's author in edit view)
 
### Framework components for managing collections (ie: adding/removing ContainsMany/HasMany fields)


## Defered Features
- Caching
- Pagination
- Declarative configuration of how data is loaded (ie: Dont load this Post's comments until the component is on screen)

## Open Questions/Strings to pull
- [ ] Polymorphic relationships?
- [ ] Consider blockchain transaction indexing - Hassan has knowledge
- [ ] Consider music registry examples - Burcu has knowledge
- [ ] Generate some basic prose on the design decisions for Chris to use in the community
