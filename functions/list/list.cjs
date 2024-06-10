import { Client } from "@notionhq/client";
import * as AWS from 'aws-sdk';
import * as fs from 'fs';
import Airtable from "airtable";

// https://www.youtube.com/watch?v=qcQYA6QZFww
const handler = async (event) => {
  try {
    let response = {}
    response = {}
    /* list all the records from airtbale base
    const base = new Airtable({apiKey: process.env.AIRTABLE_API_KEY}).base(process.env.AIRTABLE_BASE_ID);
    response = await base(process.env.AIRTABLE_TABLE_ID).select({
      maxRecords: 50,
      view: "Grid view"
    }).firstPage();
    */

    /* const subject = event.queryStringParameters.name || 'World'*/ 
    const {NOTION_KEY, NOTION_DB} = process.env;
    const notion = new Client({ auth: NOTION_KEY });
    response = await notion.databases.query({
      database_id: NOTION_DB,
      filter: {
        property: 'state',
        select: {
          equals: 'published',
        },
      }
    });
    

    return {
      statusCode: 200,
      conentType: 'application/json',
      body: JSON.stringify(response),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
