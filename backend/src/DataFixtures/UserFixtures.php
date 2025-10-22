<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class UserFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {}

    public function load(ObjectManager $manager): void
    {
        // Usuario SUPER ADMIN
        $admin = new User();
        $admin->setEmail('admin@conductorhub.com');
        $admin->setName('Administrador Principal');
        $admin->setRoles(['ROLE_SUPER_ADMIN', 'ROLE_USER']);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'password123'));
        $admin->setCreatedAt(new \DateTime());
        $admin->setUpdatedAt(new \DateTime());
        
        $manager->persist($admin);

        // Usuario normal 1
        $user1 = new User();
        $user1->setEmail('usuario1@conductorhub.com');
        $user1->setName('Usuario Uno');
        $user1->setRoles(['ROLE_USER']);
        $user1->setPassword($this->passwordHasher->hashPassword($user1, 'password123'));
        $user1->setCreatedAt(new \DateTime());
        $user1->setUpdatedAt(new \DateTime());
        
        $manager->persist($user1);

        // Usuario normal 2
        $user2 = new User();
        $user2->setEmail('usuario2@conductorhub.com');
        $user2->setName('Usuario Dos');
        $user2->setRoles(['ROLE_USER']);
        $user2->setPassword($this->passwordHasher->hashPassword($user2, 'password123'));
        $user2->setCreatedAt(new \DateTime());
        $user2->setUpdatedAt(new \DateTime());
        
        $manager->persist($user2);

        $manager->flush();
    }
}