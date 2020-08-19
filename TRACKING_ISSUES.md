# Tracking Issues

A list of random issues that are either bugs or features that will cause changes in this repo.

- Jest & ES6 Modules
  Currently Jest does not support es6 Modules, so modules can not be used in testing
  lodash-es is tree shakeable, as it date-fn/esm/, however fails tests at the moment so install individual common lodash libraries for now then remove them when
  the below issue is resolved.

  https://github.com/facebook/jest/issues/4842
  https://github.com/facebook/jest/issues/9430

  Change Ramda imports after jest allows native modules
  https://github.com/ramda/ramda/issues/2406

  date-fns/esm/modules

- RXJS & TypeScript Filter Issues
  TS does not correctly infer the types when using filters, this means you need to explicitly type the observable current typescript issues

  https://github.com/Microsoft/TypeScript/issues/10734
  https://github.com/Microsoft/TypeScript/issues/16069

- TS Path References are not inherited
  Once merged, remove references from the tsconfig.lib.json's
  https://github.com/Microsoft/TypeScript/issues/27098

- Nativescript does not currently support the monorepo design
  https://github.com/NativeScript/NativeScript/issues/7537

* TypeScript `-b` command does not allow additional flags.
  once this is implemented, then there will be no need for the `tsconfig.docker.json` files for the building of docker
  https://github.com/microsoft/TypeScript/issues/25613

* remove utility middleware once this is supported natively
  https://github.com/apollographql/apollo-feature-requests/issues/6

* when the small scroll package is available, use this for the drag & drop
  https://github.com/angular/components/pull/18082

* Currently the todos query manually removes a todo from the cache on the all todos query ONLY
  This is not an issue in the Todo App because there is only one query, however this would not work
  If different queries queried todos.
  When Apollo Client v3 (apollo-angular 2) is released, use the cache.evict /.release /.gc etc
  https://github.com/apollographql/apollo-feature-requests/issues/5
