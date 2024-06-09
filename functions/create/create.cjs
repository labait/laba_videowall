import { Client } from "@notionhq/client";
const fs = require('fs');
const AWS = require('aws-sdk');

const handler = async (event) => {
  try {
    // check if method is POST and that the body contains a message
    if (event.httpMethod !== 'POST' || !event.body) {
      return { statusCode: 400, body: 'Bad Request' }
    }
    const data = JSON.parse(event.body)

    let bucket_base_url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/`
    let response = {}
    // gest test video reading file public/assets/test.webm
    const video = fs.readFileSync('public/assets/test.webm');
    // generate filename based on timestamp and random number
    const basename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    const format_input = 'webm';
    const format_output = 'mp4';
    // set s3 credentials from env
    AWS.config.update({
      accessKeyId: process.env.S3_ACCESS_KEY_ID,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
      region: process.env.S3_REGION
    });
    // upload video to s3
    const s3 = new AWS.S3()
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `${basename}.${format_input}`,
      Body: video,
      ACL: 'public-read',
      ContentType: `video/${format_input}`
    };
    response_upload = await s3.upload(params).promise();
    response = response_upload
    let file_url = response_upload.Location;

    /* convert file to mp4 with aws transcoder 
    const transcoderParams = {
      PipelineId: process.env.ELASTIC_ENCODER_PIPELINE_ID,
      Input: {
        Key: `${basename}.${format_input}`,
      },
      Output: {
        Key: `processed/${basename}.${format_output}`,
        PresetId: process.env.ELASTIC_ENCODER_PRESET_ID, 
      }
    };
    const transcoder = new AWS.ElasticTranscoder();
    response_encoder  = await transcoder.createJob(transcoderParams).promise();
    file_url = `${bucket_base_url}${response_encoder.Job.Output.Key}` 
    */

    response = {file_url}
    /* create a new record in notion, consider message as text, sender as text, video_url as url */
    const {NOTION_KEY, NOTION_DB} = process.env;
    const notion = new Client({ auth: NOTION_KEY });
    response = await notion.pages.create({
      parent: { database_id: NOTION_DB },
      properties: {
        title: {
          title: [
            {
              type: "text",
              text: {
                content: basename,
              }
            }
          ]
        },
        state: {
          select: {
            name: "created",
          }
        },
        message: {
          rich_text: [
            {
              text: {
                content: data.message,
              }
            }
          ]
        },
        sender: {
          rich_text: [
            {
              text: {
                content: data.sender,
              }
            }
          ]
        },
        video : {
          type: "files",
          files: [
            {
              name: `${basename}.${format_output}`,
              external: {
                url: file_url,
              }
            }
          ]
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
