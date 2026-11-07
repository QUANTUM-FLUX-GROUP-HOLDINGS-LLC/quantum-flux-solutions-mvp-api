import { Injectable, UnauthorizedException, ConflictException 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

} from '@nestjs/common';
import { JwtService 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

} from '@nestjs/jwt';
import { PrismaService 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

} from '../core/database/prisma.service';
import * as bcrypt from 'bcrypt';
import { MailService 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

} from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private mail: MailService,
  ) {
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

}

  async register(data: { email: string; password: string; name: string 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

}) {
    const existing = await this.prisma.customer.findUnique({ where: { email: data.email 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

} 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

});
    if (existing) throw new ConflictException('Email already in use');

    const hash = await bcrypt.hash(data.password, 10);

    const customer = await this.prisma.customer.create({
      data: { email: data.email, password: hash, name: data.name, role: 'CLIENT' 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

},
    
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

});

    await this.mail.sendWelcomeEmail(customer.email, customer.name);

    return this.login(customer.email, data.password);
  
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

}

  async login(email: string, pass: string) {
    const user = await this.prisma.customer.findUnique({ where: { email 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

} 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

});
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(pass, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: user.id, email: user.email, role: user.role 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

};
    const token = this.jwt.sign(payload);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        // FIX: entitlements must reach the client on login,
        // otherwise dashboard/PortalLayout treat every service as locked.
        services: user.services ?? [],
      
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

},
    
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

};
  
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

}

  // Fresh, sanitized profile for /auth/me.
  // JwtStrategy already loads the full Customer, but we re-select here so the
  // response shape is explicit and `password` never leaks to the client.
  async getFreshUser(userId: string) {
    const user = await this.prisma.customer.findUnique({
      where: { id: userId 
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

},
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        services: true,
      
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

},
    
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

});
    if (!user) throw new UnauthorizedException();
    return user;
  
  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

}

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.prisma.customer.findUnique({ where: { id: userId } });
    if (!user || !user.password) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password);
    if (!isValid) throw new Error('Incorrect current password');

    const hashed = await bcrypt.hash(newPass, 10);
    await this.prisma.customer.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return { success: true };
  }

}
