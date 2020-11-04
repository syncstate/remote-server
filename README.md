## [Work In Progress]

> Note: Only basic APIs are ready. Core functionality hasn't been implemented.

SyncState Remote plugin has two parts [@syncstate/remote-client](https://github.com/syncstate/remote-client) and [@syncstate/remote-server](https://github.com/syncstate/remote-server).

Remote plugin helps you implement multiplayer functionality for your app. 

The client part provides you loading state for parts of your document which have been remote enabled. It applies optimistic updates in changes received from server and reverses them when needed.

The server part handles conflicting updates.

## Installation

```jsx
# Server 
yarn add @syncstate/remote-server

# Client
yarn add @syncstate/remote-client
```
