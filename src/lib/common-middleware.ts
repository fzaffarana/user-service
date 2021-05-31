import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import httpErrorHandler from '@middy/http-error-handler'
import httpEventNormalizer from '@middy/http-event-normalizer'
import httpCors from '@middy/http-cors'
import { APIGatewayProxyHandler } from 'aws-lambda'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const commonMiddleware = (handler: APIGatewayProxyHandler) =>
  middy(handler).use([jsonBodyParser(), httpErrorHandler(), httpEventNormalizer(), httpCors()])
