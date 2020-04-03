import BbAudit, * as index from './index'
import { Query, Table } from './util/query'
import * as dotenv from 'dotenv'

dotenv.config()

describe('Authenticate', () => {
  let bbaudit: BbAudit

  beforeAll(() => {
    bbaudit = new BbAudit(process.env.APIURL, process.env.DBID,)
  })
  it('should return status 200 on success', async () => {
    let result = await bbaudit.initialize(process.env.DBSECRET, true)
    expect(result).toBe(200)
  })

})

describe('Send Queries', () => {
  let bbaudit: BbAudit

  beforeAll(async () => {
    bbaudit = new BbAudit(process.env.APIURL, process.env.DBID,)
    await bbaudit.initialize(process.env.DBSECRET, true)
  })

  it('should submit queries [Tables]', async () => {
    let table: Table = { table: 'personName', columns: ['familyName', 'givenName'] }
    let query: Query = {
      action: 'Read',
      group: 'physicians',
      returnedRows: 4,
      tables: [table],
      user: 'user2',
      timestamp: 2222222,
    }
    let queries: Array<Query> = [query]
    let result = await bbaudit.sendQuery(queries, true)
    expect(result).toBe(201)
  })

  it('should submit queries [SQL Query]', async () => {
    const sqlQuery = `SELECT familyName FROM personName`
    let query: Query = {
      sql: sqlQuery,
      timestamp: 1571178690,
      user: '2d4da3f1-6bd3-494f-ba08-eda4fe88f9e9',
      group: 'Admins',
      returnedRows: 6,
    }
    let queries: Array<Query> = [query]
    let result = await bbaudit.sendQuery(queries, true)
    expect(result).toBe(201)
  })

  it ('should not send non-Pii data', async () => {
    let table: Table = { table: 'personName', columns: ['address', 'dateOfBirth'] }
    let query: Query = {
      action: 'IncorrectAction',
      group: 'physicians',
      returnedRows: 4,
      tables: [table],
      user: 'user4',
      timestamp: 2222222,
    }
    let queries: Array<Query> = [query]
    let result = await bbaudit.sendQuery(queries, true)
    expect(result).toBe(201)
  })
})

describe('Production environment should fail', () => {
  let bbaudit: BbAudit

  beforeAll(() => {
    bbaudit = new BbAudit(process.env.APIURL, process.env.DBID,)
  })

  it('should throw an error when initializing in production env', async () => {
    expect.assertions(1)
    try {
      await bbaudit.initialize(process.env.DBSECRET)
    } catch (e) {
      expect(e.message).toBe('Production environment not available. Please use the sandbox environment.')
    }
  })

  it('should throw an error when sending queries in production env', async () => {
    expect.assertions(1)
    try {
      let table: Table = { table: 'personName', columns: ['address', 'dateOfBirth'] }
      let query: Query = {
        action: 'IncorrectAction',
        group: 'physicians',
        returnedRows: 4,
        tables: [table],
        user: 'user4',
        timestamp: 2222222,
      }
      let queries: Array<Query> = [query]
      await bbaudit.sendQuery(queries)
    } catch (e) {
      expect(e.message).toBe('Production environment not available. Please use the sandbox environment.')
    }
  })

})