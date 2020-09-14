export interface ValidateSchema {
  required?: string[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>
}
