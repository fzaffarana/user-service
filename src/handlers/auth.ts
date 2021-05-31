import jwt from 'jsonwebtoken'

interface IStatement {
  Action: string
  Effect: string
  Resource: string
}

interface IPolicyDocument {
  Version: string
  Statement: IStatement[]
}

interface IAuthResponse {
  principalId: string
  policyDocument?: IPolicyDocument
}

const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {} as IAuthResponse

  authResponse.principalId = principalId
  if (effect && resource) {
    const policyDocument = {} as IPolicyDocument

    policyDocument.Version = '2012-10-17'
    policyDocument.Statement = []
    const statementOne = {} as IStatement

    statementOne.Action = 'execute-api:Invoke'
    statementOne.Effect = effect
    statementOne.Resource = resource
    policyDocument.Statement[0] = statementOne
    authResponse.policyDocument = policyDocument
  }

  return authResponse
}

interface AuthEvent {
  authorizationToken: string
  methodArn: string
}

export const handler = async (event: AuthEvent): Promise<IAuthResponse> => {
  if (!event.authorizationToken) {
    throw 'Unauthorized'
  }

  const tokenParts = event.authorizationToken.split(' ')
  const tokenValue = tokenParts[1]

  if (!(tokenParts[0].toLowerCase() === 'bearer' && tokenValue)) {
    throw 'Unauthorized'
  }

  try {
    const claims = jwt.verify(tokenValue, process.env.AUTH0_PUBLIC_KEY)

    return generatePolicy(claims.sub, 'Allow', event.methodArn)
  } catch (error) {
    console.error('Invalid Token', error)
    throw 'Unauthorized'
  }
}
