declare module '@babel/standalone' {
    export function transform(
      code: string, 
      options?: any
    ): { code: string; map?: any; ast?: any };
    
    // Add any other specific functions you need
  }