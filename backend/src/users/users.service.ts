import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private readonly SALT_ROUNDS = 10;

  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Create a new user with hashed password
   */
  async create(dto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existing = await this.userRepo.findOne({
      where: { matricule: dto.matricule },
    });

    if (existing) {
      throw new ConflictException(
        `Matricule "${dto.matricule}" is already registered.`,
      );
    }

    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    const user = this.userRepo.create({
      ...dto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepo.save(user);
    return this.sanitizeUser(savedUser);
  }

  /**
   * Fetch all users ordered by creation date
   */
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepo.find({ order: { createdAt: 'DESC' } });
    return users.map((user) => this.sanitizeUser(user));
  }

  /**
   * Internal lookup used by Auth service (includes password)
   */
  async findByMatricule(matricule: string): Promise<User | null> {
    return this.userRepo.findOne({ where: { matricule } });
  }

  /**
   * Fetch a single user by ID
   */
  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    return this.sanitizeUser(user);
  }

  /**
   * Safely update user properties without corrupting state or crashing on missing fields
   */
  async update(
    id: string,
    dto: UpdateUserDto = {},
  ): Promise<Omit<User, 'password'>> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    // Check unique matricule collision if changing matricules
    if (dto.matricule && dto.matricule !== user.matricule) {
      const existing = await this.userRepo.findOne({
        where: { matricule: dto.matricule },
      });

      if (existing) {
        throw new ConflictException(
          `Matricule "${dto.matricule}" is already in use by another user.`,
        );
      }
    }

    // Build update payload safely
    const updatePayload: Partial<User> = { ...dto };

    // Hash password only if a non-empty string is provided
    if (dto.password && dto.password.trim() !== '') {
      updatePayload.password = await bcrypt.hash(
        dto.password,
        this.SALT_ROUNDS,
      );
    } else {
      delete updatePayload.password;
    }

    Object.assign(user, updatePayload);

    const savedUser = await this.userRepo.save(user);
    return this.sanitizeUser(savedUser);
  }

  /**
   * Delete a user account
   */
  async remove(id: string): Promise<{ message: string; id: string }> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    const matricule = user.matricule;
    await this.userRepo.remove(user);

    return {
      message: `User with Matricule "${matricule}" was successfully deleted.`,
      id,
    };
  }

  /**
   * Helper method to strip sensitive password hash from user output
   */
  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
