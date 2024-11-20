import { MongoClient, ServerApiVersion } from 'mongodb'

if (!process.env.NEXT_PUBLIC_MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.NEXT_PUBLIC_MONGODB_URI
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

// In production mode, it's best to not use a global variable.
client = new MongoClient(uri, options)
clientPromise = client.connect()
  .then(async (client) => {
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 })
    console.log("Pinged your deployment. You successfully connected to MongoDB!")
    return client
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  })

// Export a module-scoped MongoClient promise. By doing this in a
// separate module, the client can be shared across functions.
export default clientPromise