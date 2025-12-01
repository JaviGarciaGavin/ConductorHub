<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20251201040235 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE notification CHANGE related_entity_type related_entity_type VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE project_invitation CHANGE accepted_at accepted_at DATETIME DEFAULT NULL, CHANGE rejected_at rejected_at DATETIME DEFAULT NULL');
        $this->addSql('ALTER TABLE user CHANGE roles roles JSON NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE notification CHANGE related_entity_type related_entity_type VARCHAR(255) DEFAULT \'NULL\'');
        $this->addSql('ALTER TABLE project_invitation CHANGE accepted_at accepted_at DATETIME DEFAULT \'NULL\', CHANGE rejected_at rejected_at DATETIME DEFAULT \'NULL\'');
        $this->addSql('ALTER TABLE user CHANGE roles roles LONGTEXT NOT NULL COLLATE `utf8mb4_bin`');
    }
}
