// eslint-disable-next-line import/extensions
import Paw from 'types/paw'
// eslint-disable-next-line import/no-cycle
import { makeEnvDv, makeDs } from './paw-utils'
// eslint-disable-next-line import/extensions
import { MapKeyedWithString } from 'types/openapi'
// import Console from "./console";

class EnvironmentManager {
  private readonly name: string

  private readonly envName: string

  private context: Paw.Context

  private environmentDomain: Paw.EnvironmentDomain | null

  constructor(context: Paw.Context, name?: string | null) {
    this.name = name || 'OpenAPI Environment'
    this.envName = 'Default'
    this.context = context
    this.environmentDomain = null
  }

  private getEnvironmentDomain(): Paw.EnvironmentDomain {
    if (!this.environmentDomain) {
      this.environmentDomain = this.context.getEnvironmentDomainByName(
        this.name,
      )
      if (!this.environmentDomain) {
        this.environmentDomain = this.context.createEnvironmentDomain(this.name)
        this.environmentDomain.createEnvironment(this.envName)
      }
    }
    return this.environmentDomain
  }

  public hasEnvironmentVariable(name: string): boolean {
    return this.getEnvironmentDomain().getVariableByName(name) != null
  }

  public getEnvironmentVariable(name: string): Paw.EnvironmentVariable {
    let variable = this.getEnvironmentDomain().getVariableByName(name)
    if (!variable) {
      variable = this.getEnvironmentDomain().createEnvironmentVariable(name)
    }
    return variable
  }

  public getDynamicValue(variableName: string): DynamicValue {
    const variable = this.getEnvironmentVariable(variableName)
    return makeEnvDv(variable.id)
  }

  public getDynamicString(variableName: string): DynamicString {
    return makeDs(this.getDynamicValue(variableName))
  }

  public setEnvironmentVariableValue(
    variableName: string,
    variableValue: string,
  ) {
    const env = this.getEnvironmentDomain().getEnvironmentByName(this.envName)

    const varMap: MapKeyedWithString<string> = {}
    varMap[variableName] = variableValue
    env?.setVariablesValues(varMap)
  }
}

export default EnvironmentManager
