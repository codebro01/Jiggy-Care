# Apply @ApiHeader Decorator to All NestJS Controller Routes

Apply this `@ApiHeader` decorator to **every route** in all your NestJS controllers:

```typescript
@ApiHeader({
  name: 'x-client-type',
  description:
    'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
  required: false,
  schema: {
    type: 'string',
    enum: ['mobile', 'web'],
    example: 'mobile',
  },
})
```

## Instructions

1. **Open each controller file** in your NestJS project
2. **Add the decorator above each route method** (`@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`)
3. **Do not modify any other code** - only add this decorator
4. **Place it before other API decorators** like `@ApiResponse()`, `@ApiOperation()`, etc.

## Example Application

### Before:
```typescript
@Controller('auth')
export class AuthController {
  @Post('signin')
  @ApiResponse({ status: 200, description: 'User authenticated' })
  async signin(@Body() body: LoginDto) {
    // ...
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  async getProfile(@Req() req) {
    // ...
  }
}
```

### After:
```typescript
@Controller('auth')
export class AuthController {
  @Post('signin')
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  @ApiResponse({ status: 200, description: 'User authenticated' })
  async signin(@Body() body: LoginDto) {
    // ...
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiHeader({
    name: 'x-client-type',
    description:
      'Client type identifier. Set to "mobile" for mobile applications (React Native, etc.). If not provided, the server will attempt to detect the client type automatically.',
    required: false,
    schema: {
      type: 'string',
      enum: ['mobile', 'web'],
      example: 'mobile',
    },
  })
  @ApiResponse({ status: 200, description: 'Profile retrieved' })
  async getProfile(@Req() req) {
    // ...
  }
}
```

## Apply to These Routes

Add the decorator to **all HTTP method decorators**:
- `@Get()`
- `@Post()`
- `@Put()`
- `@Patch()`
- `@Delete()`
- `@Options()`
- `@Head()`

## What NOT to Change

- ❌ Do not modify existing decorators
- ❌ Do not change method implementations
- ❌ Do not alter imports (unless `@ApiHeader` is missing)
- ❌ Do not change route paths or parameters
- ✅ Only add the `@ApiHeader` decorator

## Ensure Import

Make sure `@ApiHeader` is imported in each controller:

```typescript
import { Controller, Get, Post, /* ... */ } from '@nestjs/common';
import { ApiHeader, ApiResponse, ApiOperation } from '@nestjs/swagger';
```

## Result

After applying this decorator to all routes, your Swagger documentation will show the `x-client-type` header option on every endpoint, allowing API consumers to specify whether they're calling from a mobile or web client.