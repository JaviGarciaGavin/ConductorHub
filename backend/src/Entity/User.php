<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

#[ApiResource]
#[ApiFilter(SearchFilter::class, properties: [
    'email' => 'ipartial',
    'name' => 'ipartial',
])]
#[ApiFilter(OrderFilter::class, properties: ['id', 'name', 'email', 'createdAt'])]
#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    // CONSTANTES DE ROLES FIJOS
    public const ROLE_SUPER_ADMIN = 'ROLE_SUPER_ADMIN';
    public const ROLE_ADMIN = 'ROLE_ADMIN';
    public const ROLE_DEVELOPER = 'ROLE_DEVELOPER';
    public const ROLE_VIEWER = 'ROLE_VIEWER';
    public const ROLE_USER = 'ROLE_USER';

    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 180, unique: true)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $password = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column]
    private ?\DateTime $createdAt = null;

    #[ORM\Column]
    private ?\DateTime $updatedAt = null;

    #[ORM\Column]
    private array $roles = [];

    /**
     * @var Collection<int, Project>
     */
    #[ORM\OneToMany(mappedBy: 'userOwner', targetEntity: Project::class)]
    private Collection $projectsOwned;

    /**
     * @var Collection<int, Ticket>
     */
    #[ORM\OneToMany(mappedBy: 'userCreator', targetEntity: Ticket::class)]
    private Collection $ticketsCreated;

    /**
     * @var Collection<int, Ticket>
     */
    #[ORM\OneToMany(mappedBy: 'userAssigned', targetEntity: Ticket::class)]
    private Collection $ticketsAssigned;

    /**
     * @var Collection<int, Comment>
     */
    #[ORM\OneToMany(mappedBy: 'user', targetEntity: Comment::class)]
    private Collection $comments;

    /**
     * @var Collection<int, ProjectMember>
     */
    #[ORM\OneToMany(targetEntity: ProjectMember::class, mappedBy: 'user')]
    private Collection $projectMembers;

    /**
     * @var Collection<int, ProjectInvitation>
     */
    #[ORM\OneToMany(targetEntity: ProjectInvitation::class, mappedBy: 'inviter')]
    private Collection $projectInvitationsSent;

    /**
     * @var Collection<int, ProjectInvitation>
     */
    #[ORM\OneToMany(targetEntity: ProjectInvitation::class, mappedBy: 'invitedUser')]
    private Collection $projectInvitationsReceived;

    /**
     * @var Collection<int, Notification>
     */
    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'user')]
    private Collection $notifications;

    public function __construct()
    {
        $this->projectsOwned = new ArrayCollection();
        $this->ticketsCreated = new ArrayCollection();
        $this->ticketsAssigned = new ArrayCollection();
        $this->comments = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->updatedAt = new \DateTime();
        $this->projectMembers = new ArrayCollection();
        $this->projectInvitationsSent = new ArrayCollection();
        $this->projectInvitationsReceived = new ArrayCollection();
        $this->notifications = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;
        return $this;
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;
        return $this;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;
        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): static
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(\DateTime $updatedAt): static
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = self::ROLE_USER; // Todos tienen ROLE_USER
        return array_unique($roles);
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;
        return $this;
    }

    public static function getAvailableRoles(): array
    {
        return [
            self::ROLE_SUPER_ADMIN,
            self::ROLE_ADMIN,
            self::ROLE_DEVELOPER,
            self::ROLE_VIEWER,
            self::ROLE_USER
        ];
    }

    // MÉTODOS HELPER PARA ROLES
    public function isSuperAdmin(): bool
    {
        return in_array(self::ROLE_SUPER_ADMIN, $this->getRoles());
    }

    public function isAdmin(): bool
    {
        return in_array(self::ROLE_ADMIN, $this->getRoles());
    }

    public function isDeveloper(): bool
    {
        return in_array(self::ROLE_DEVELOPER, $this->getRoles());
    }

    public function isViewer(): bool
    {
        return in_array(self::ROLE_VIEWER, $this->getRoles());
    }

    // MÉTODOS DE PERMISOS
    public function canManageProjects(): bool
    {
        return $this->isSuperAdmin() || $this->isAdmin();
    }

    public function canCreateTickets(): bool
    {
        return !$this->isViewer();
    }

    public function getUserIdentifier(): string
    {
    return (string) $this->email;
    }
    
    public function eraseCredentials(): void
    {

    }

// Para compatibilidad (opcional pero recomendado)
public function getUsername(): string
    {
    return $this->getUserIdentifier();
    }

    /**
     * @return Collection<int, Project>
     */
    public function getProjectsOwned(): Collection
    {
        return $this->projectsOwned;
    }

    public function addProjectsOwned(Project $projectsOwned): static
    {
        if (!$this->projectsOwned->contains($projectsOwned)) {
            $this->projectsOwned->add($projectsOwned);
            $projectsOwned->setUserOwner($this);
        }
        return $this;
    }

    public function removeProjectsOwned(Project $projectsOwned): static
    {
        if ($this->projectsOwned->removeElement($projectsOwned)) {
            if ($projectsOwned->getUserOwner() === $this) {
                $projectsOwned->setUserOwner(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Ticket>
     */
    public function getTicketsCreated(): Collection
    {
        return $this->ticketsCreated;
    }

    public function addTicketsCreated(Ticket $ticketsCreated): static
    {
        if (!$this->ticketsCreated->contains($ticketsCreated)) {
            $this->ticketsCreated->add($ticketsCreated);
            $ticketsCreated->setUserCreator($this);
        }
        return $this;
    }

    public function removeTicketsCreated(Ticket $ticketsCreated): static
    {
        if ($this->ticketsCreated->removeElement($ticketsCreated)) {
            if ($ticketsCreated->getUserCreator() === $this) {
                $ticketsCreated->setUserCreator(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Ticket>
     */
    public function getTicketsAssigned(): Collection
    {
        return $this->ticketsAssigned;
    }

    public function addTicketsAssigned(Ticket $ticketsAssigned): static
    {
        if (!$this->ticketsAssigned->contains($ticketsAssigned)) {
            $this->ticketsAssigned->add($ticketsAssigned);
            $ticketsAssigned->setUserAssigned($this);
        }
        return $this;
    }

    public function removeTicketsAssigned(Ticket $ticketsAssigned): static
    {
        if ($this->ticketsAssigned->removeElement($ticketsAssigned)) {
            if ($ticketsAssigned->getUserAssigned() === $this) {
                $ticketsAssigned->setUserAssigned(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, Comment>
     */
    public function getComments(): Collection
    {
        return $this->comments;
    }

    public function addComment(Comment $comment): static
    {
        if (!$this->comments->contains($comment)) {
            $this->comments->add($comment);
            $comment->setUser($this);
        }
        return $this;
    }

    public function removeComment(Comment $comment): static
    {
        if ($this->comments->removeElement($comment)) {
            if ($comment->getUser() === $this) {
                $comment->setUser(null);
            }
        }
        return $this;
    }

    /**
     * @return Collection<int, ProjectMember>
     */
    public function getProjectMembers(): Collection
    {
        return $this->projectMembers;
    }

    public function addProjectMember(ProjectMember $projectMember): static
    {
        if (!$this->projectMembers->contains($projectMember)) {
            $this->projectMembers->add($projectMember);
            $projectMember->setUser($this);
        }

        return $this;
    }

    public function removeProjectMember(ProjectMember $projectMember): static
    {
        if ($this->projectMembers->removeElement($projectMember)) {
            // set the owning side to null (unless already changed)
            if ($projectMember->getUser() === $this) {
                $projectMember->setUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ProjectInvitation>
     */
    public function getProjectInvitationsSent(): Collection
    {
        return $this->projectInvitationsSent;
    }

    public function addProjectInvitationsSent(ProjectInvitation $projectInvitationsSent): static
    {
        if (!$this->projectInvitationsSent->contains($projectInvitationsSent)) {
            $this->projectInvitationsSent->add($projectInvitationsSent);
            $projectInvitationsSent->setInviter($this);
        }

        return $this;
    }

    public function removeProjectInvitationsSent(ProjectInvitation $projectInvitationsSent): static
    {
        if ($this->projectInvitationsSent->removeElement($projectInvitationsSent)) {
            // set the owning side to null (unless already changed)
            if ($projectInvitationsSent->getInviter() === $this) {
                $projectInvitationsSent->setInviter(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, ProjectInvitation>
     */
    public function getProjectInvitationsReceived(): Collection
    {
        return $this->projectInvitationsReceived;
    }

    public function addProjectInvitationsReceived(ProjectInvitation $projectInvitationsReceived): static
    {
        if (!$this->projectInvitationsReceived->contains($projectInvitationsReceived)) {
            $this->projectInvitationsReceived->add($projectInvitationsReceived);
            $projectInvitationsReceived->setInvitedUser($this);
        }

        return $this;
    }

    public function removeProjectInvitationsReceived(ProjectInvitation $projectInvitationsReceived): static
    {
        if ($this->projectInvitationsReceived->removeElement($projectInvitationsReceived)) {
            // set the owning side to null (unless already changed)
            if ($projectInvitationsReceived->getInvitedUser() === $this) {
                $projectInvitationsReceived->setInvitedUser(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Notification>
     */
    public function getNotifications(): Collection
    {
        return $this->notifications;
    }

    public function addNotification(Notification $notification): static
    {
        if (!$this->notifications->contains($notification)) {
            $this->notifications->add($notification);
            $notification->setUser($this);
        }

        return $this;
    }

    public function removeNotification(Notification $notification): static
    {
        if ($this->notifications->removeElement($notification)) {
            // set the owning side to null (unless already changed)
            if ($notification->getUser() === $this) {
                $notification->setUser(null);
            }
        }

        return $this;
    }
}