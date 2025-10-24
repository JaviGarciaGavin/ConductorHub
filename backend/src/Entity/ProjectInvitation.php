<?php

namespace App\Entity;

use App\Repository\ProjectInvitationRepository;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;

#[ApiResource]
#[ORM\Entity(repositoryClass: ProjectInvitationRepository::class)]
class ProjectInvitation
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180)]
    private ?string $invitedEmail = null;

    #[ORM\Column(length: 255)]
    private ?string $token = null;

    #[ORM\Column(length: 255)]
    private ?string $role = null;

    #[ORM\Column(length: 255)]
    private ?string $status = null;

    #[ORM\Column]
    private ?\DateTime $expiresAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $acceptedAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $rejectedAt = null;

    #[ORM\ManyToOne(inversedBy: 'projectInvitations')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Project $project = null;

    #[ORM\ManyToOne(inversedBy: 'projectInvitationsSent')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $inviter = null;

    #[ORM\ManyToOne(inversedBy: 'projectInvitationsReceived')]
    private ?User $invitedUser = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getInvitedEmail(): ?string
    {
        return $this->invitedEmail;
    }

    public function setInvitedEmail(string $invitedEmail): static
    {
        $this->invitedEmail = $invitedEmail;

        return $this;
    }

    public function getToken(): ?string
    {
        return $this->token;
    }

    public function setToken(string $token): static
    {
        $this->token = $token;

        return $this;
    }

    public function getRole(): ?string
    {
        return $this->role;
    }

    public function setRole(string $role): static
    {
        $this->role = $role;

        return $this;
    }

    public function getStatus(): ?string
    {
        return $this->status;
    }

    public function setStatus(string $status): static
    {
        $this->status = $status;

        return $this;
    }

    public function getExpiresAt(): ?\DateTime
    {
        return $this->expiresAt;
    }

    public function setExpiresAt(\DateTime $expiresAt): static
    {
        $this->expiresAt = $expiresAt;

        return $this;
    }

    public function getAcceptedAt(): ?\DateTime
    {
        return $this->acceptedAt;
    }

    public function setAcceptedAt(?\DateTime $acceptedAt): static
    {
        $this->acceptedAt = $acceptedAt;

        return $this;
    }

    public function getRejectedAt(): ?\DateTime
    {
        return $this->rejectedAt;
    }

    public function setRejectedAt(?\DateTime $rejectedAt): static
    {
        $this->rejectedAt = $rejectedAt;

        return $this;
    }

    public function getProject(): ?Project
    {
        return $this->project;
    }

    public function setProject(?Project $project): static
    {
        $this->project = $project;

        return $this;
    }

    public function getInviter(): ?User
    {
        return $this->inviter;
    }

    public function setInviter(?User $inviter): static
    {
        $this->inviter = $inviter;

        return $this;
    }

    public function getInvitedUser(): ?User
    {
        return $this->invitedUser;
    }

    public function setInvitedUser(?User $invitedUser): static
    {
        $this->invitedUser = $invitedUser;

        return $this;
    }
}
