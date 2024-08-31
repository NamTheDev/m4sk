const fetch = require('node-fetch');

// A class that wraps MongoDB Data API operations to simulate collection methods
class MongoDatabaseCollection {
  constructor() {
    // MongoDB Data API configuration
    this.url = 'https://data.mongodb-api.com/app/data-tincyab/endpoint/data/v1/action';
    this.apiKey = process.env.MONGODB_API_KEY;
    this.database = 'M4sk';
    this.collection = 'Economy';
    if(!this.apiKey) {
      throw new Error('MONGODB_API_KEY is not set');
    }
  }

  // Helper method to send a request to the MongoDB Data API
  // Handles the HTTP request and returns the JSON response
  _request = async (method, bodyParams) => {
    const response = await fetch(`${this.url}/${method}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': this.apiKey,
      },
      body: JSON.stringify(bodyParams),
    });
    return await response.json();
  }

  // Inserts a single document into the collection
  // document: The document to insert
  insertOne = async (document) => this._request('insertOne', {
    dataSource: 'Cluster0',
    database: this.database,
    collection: this.collection,
    document: document,
  })

  // Updates a single document in the collection
  // filter: The criteria to select the document to update
  // update: The update operations to apply
  updateOne = async (filter, update) => this._request('updateOne', {
    dataSource: 'Cluster0',
    database: this.database,
    collection: this.collection,
    filter: filter,
    update: { $set: update },
    upsert: true,
  })

  // Deletes a single document from the collection
  // filter: The criteria to select the document to delete
  deleteOne = async (filter) => this._request('deleteOne', {
    dataSource: 'Cluster0',
    database: this.database,
    collection: this.collection,
    filter: filter,
  })

  // Finds a single document in the collection
  // filter: The criteria to select the document
  findOne = async (filter) => this._request('findOne', {
    dataSource: 'Cluster0',
    database: this.database,
    collection: this.collection,
    filter: filter,
  }) || { document: null };

  // Finds multiple documents in the collection
  // filter: The criteria to select the documents
  find = async (filter) => this._request('find', {
    dataSource: 'Cluster0',
    database: this.database,
    collection: this.collection,
    filter: filter,
  }) || { documents: null };


  // Sets a key-value pair in the collection
  // If the key exists, it updates the value; otherwise, it inserts a new document
  // key: The unique identifier for the document
  // value: The value to be stored
  set = async (key, value) => {
    const checkifexists = await this.findOne({ key: key });
    return checkifexists ? this.updateOne({ key: key }, { value: value }) : this.insertOne({ key: key, value: value });
  }

  // Retrieves a value by its key
  // key: The unique identifier for the document
  // Returns the value if found, null otherwise
  get = async (key) => {
    const result = await this.findOne({ key: key });
    return result.document ? result.document.value : null;
  }

  // Retrieves all values from the collection
  // Returns an array of all document values
  getAll = async () => {
    const result = await this.find({});
    return result.documents ? result.documents.map(doc => doc.value) : [];
  }

  // Deletes a document by its key
  // key: The unique identifier for the document to delete
  delete = async (key) => this.deleteOne({ key: key })

  // Deletes all documents in the collection
  // Use with caution as it will remove all data
  deleteAll = async () => this._request('deleteMany', {
    dataSource: 'Cluster0',
    database: this.database,
    collection: this.collection,
    filter: {},
  })
}

module.exports = MongoDatabaseCollection;
