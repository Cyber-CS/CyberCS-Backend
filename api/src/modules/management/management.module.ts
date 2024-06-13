import { Module } from '@nestjs/common';
import { ManagementController } from './management.controller';
import { ManagementService } from './management.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/register/user.schema';
import { JwtModule } from '@nestjs/jwt';

const envJwtSecret = process.env.JWT_SECRET;

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),

    JwtModule.register({
      secret: envJwtSecret,
      signOptions: { expiresIn: '1h' }, 
    }),
  ],
  controllers: [ManagementController],
  providers: [ManagementService],
})
export class ManagementModule {}
