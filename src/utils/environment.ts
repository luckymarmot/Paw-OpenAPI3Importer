import Paw from 'types/paw'
import { createEnvDynamicValue, createDynamicString } from './dynamic-values'

export default class EnvironmentManager {
  private readonly name: string
  private readonly envName: string
  private context: Paw.Context
  private environmentDomain: Paw.EnvironmentDomain | null
  constructor(context: Paw.Context, name?: string | null) {
    this.name = name || 'Default Group'
    this.envName = name || 'Default'
    this.context = context
    this.environmentDomain = null
  }

  private getEnvironmentDomain(): Paw.EnvironmentDomain {
    const context = this.context

    this.environmentDomain =
      context.getEnvironmentDomainByName(this.name) ??
      context.createEnvironmentDomain(this.name)

    return this.environmentDomain
  }

  public hasEnvironmentVariable(name: string): boolean {
    return !!this.getEnvironmentDomain().getVariableByName(name)
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
    return createEnvDynamicValue(variable.id)
  }

  public getDynamicString(variableName: string): DynamicString {
    return createDynamicString(this.getDynamicValue(variableName))
  }

  public setEnvironmentVariableValue(
    variableName: string,
    variableValue: string,
    onlyIfEmpty?: boolean,
  ) {
    const env = this.getEnvironmentDomain().getEnvironmentByName(this.envName)
    const variable = this.getEnvironmentVariable(variableName)
    if (env && variable && (!onlyIfEmpty || !variable.getValue(env))) {
      variable.setValue(variableValue, env)
    }
  }
}
