# Axios Multi Host

Make axios use multiple host as backup if some host is down

## Installation

Install with npm or yarn

```bash
  npm install axios axios-multi-host
  yarn add axios axios-multi-host
```

## Usage/Examples

```javascript
import axios from 'axios'
import { AxiosMultiHost } from 'axios-multi-host'

const host = new AxiosMultiHost(['https://google.com', 'https://bing.com'])
host.repetitiveCheck() // optional but recommended

const api = axios.create()
api.interceptors.request.use(host.middleware, host.error)

api.get('/search?q=tes')
```

note: `host.repetitiveCheck()` when invoked will repetitively check every host
and choose the first one from the list that is up, you can pass configuration
of this function in the example below.

## Configuration

#### configuration on `repetitiveCheck`

```javascript
const list = ['https://google.com', 'https://bing.com']
const config = {
  method: 'head',
  timeout: 30000,
}

new AxiosMultiHost(list, config)
```

| Parameter  | Type     | Default | Description                                                   |
| :--------- | :------- | :------ | :------------------------------------------------------------ |
| `method`   | `string` | `head`  | _optional_. method to check the url                           |
| `interval` | `number` | `30000` | _optional_. time interval of `repetitiveCheck` in miliseconds |

also you can change the `interval` check on run by invoke `repetitiveCheck` and passing the new timeout

```javascript
host.repetitiveCheck(60000)
```

#### Host list configuration

plain string array

```javascript
const list = ['https://google.com', 'https://bing.com']
```

from another endpoint/url

```javascript
const list = [
  {
    host: 'https://google.com',
    check: 'https://google.com/status',
  },
]
```

#### Catch all host down

```javascript
host.onAllDown(() => {
  console.log('all host down')
})
```

#### Update List

```javascript
host.updateList(['https://google.com', 'https://bing.com'])
```

#### Get current list

```javascript
host.getList()
```
