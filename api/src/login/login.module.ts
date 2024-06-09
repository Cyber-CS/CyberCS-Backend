import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [LoginService],
  imports: [
    JwtModule.register({
      secret: 'aaa', // Chave secreta para assinar o token
      signOptions: { expiresIn: '1h' }, // Opções de assinatura (opcional)
    }),
  ],
})
export class LoginModule {}
