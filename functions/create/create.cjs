import { Client } from "@notionhq/client";
const fs = require('fs');
import Busboy from "busboy"
const AWS = require('aws-sdk');

function parseMultipartForm(event) {
  return new Promise((resolve) => {
    // we'll store all form fields inside of this
    const fields = {};

    // let's instantiate our busboy instance!
    const busboy = new Busboy({
      // it uses request headers
      // to extract the form boundary value (the ----WebKitFormBoundary thing)
      headers: event.headers
    });

    // before parsing anything, we need to set up some handlers.
    // whenever busboy comes across a file ...
    busboy.on(
      "file",
      (fieldname, filestream, filename, transferEncoding, mimeType) => {
        // ... we take a look at the file's data ...
        filestream.on("data", (data) => {
          // ... and write the file's name, type and content into `fields`.
          fields[fieldname] = {
            filename,
            type: mimeType,
            content: data,
          };
        });
      }
    );

    // whenever busboy comes across a normal field ...
    busboy.on("field", (fieldName, value) => {
      // ... we write its value into `fields`.
      fields[fieldName] = value;
    });

    // once busboy is finished, we resolve the promise with the resulted fields.
    busboy.on("finish", () => {
      resolve(fields)
    });

    // now that all handlers are set up, we can finally start processing our request!
    busboy.write(event.body);
  });
}


const handler = async (event) => {
  try {
    const default_state = 'published';
    // check if method is POST and that the body contains a message
    if (event.httpMethod !== 'POST' || !event.body) {
      return { statusCode: 400, body: 'Bad Request' }
    }
    let bucket_base_url = `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/`
    let response = {}

    /* get values from post json*/
    let {message, sender, video} = JSON.parse(event.body)
    video = Buffer.from(video.replace(/^data:.+;base64,/, ""), 'base64');
    /* video = fs.readFileSync('public/assets/test.webm'); // using test video */
    

    /* get values from post form 
    const fields = await parseMultipartForm(event)
    message = fields.message
    sender = fields.sender
    video = fields.video.content
    */

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

    /* convert file to mp4 with aws transcoder */
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
            name: default_state,
          }
        },
        message: {
          rich_text: [
            {
              text: {
                content: message,
              }
            }
          ]
        },
        sender: {
          rich_text: [
            {
              text: {
                content: sender,
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
