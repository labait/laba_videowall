import { Client } from "@notionhq/client";

// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const handler = async (event) => {
  try {
    // const subject = event.queryStringParameters.name || 'World'
    const {NOTION_KEY, NOTION_DB} = process.env;

    const notion = new Client({ auth: NOTION_KEY });
    const response = await notion.databases.query({
      database_id: NOTION_DB,
      filter: {
        property: 'status',
        select: {
          equals: 'published',
        },
      }
    });
    return {
      statusCode: 200,
      body: JSON.stringify(response),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
