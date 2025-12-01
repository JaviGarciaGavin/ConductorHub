<?php

namespace App\Entity;

use App\Repository\ProjectRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Doctrine\Orm\Filter\OrderFilter;

#[ApiResource]
#[ApiFilter(SearchFilter::class, properties: [
    'userOwner' => 'exact',
    'name' => 'ipartial',
    'description' => 'ipartial',
])]
#[ApiFilter(OrderFilter::class, properties: ['id', 'name', 'createdAt', 'updatedAt'])]
#[ORM\Entity(repositoryClass: ProjectRepository::class)]
class Project
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $description = null;

    #[ORM\Column]
    private ?\DateTime $createdAt = null;

    #[ORM\Column]
    private ?\DateTime $updatedAt = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $userOwner = null;

    #[ORM\OneToMany(mappedBy: 'project', targetEntity: Ticket::class)]
    private Collection $tickets;

    #[ORM\OneToMany(mappedBy: 'project', targetEntity: ProjectMember::class)]
    private Collection $projectMembers;

    #[ORM\OneToMany(mappedBy: 'project', targetEntity: ProjectInvitation::class)]
    private Collection $projectInvitations;

    public function __construct()
    {
        $this->tickets = new ArrayCollection();
        $this->projectMembers = new ArrayCollection();
        $this->projectInvitations = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;
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

    public function getUserOwner(): ?User
    {
        return $this->userOwner;
    }

    public function setUserOwner(?User $userOwner): static
    {
        $this->userOwner = $userOwner;
        return $this;
    }

    public function getTickets(): Collection
    {
        return $this->tickets;
    }

    public function addTicket(Ticket $ticket): static
    {
        if (!$this->tickets->contains($ticket)) {
            $this->tickets->add($ticket);
            $ticket->setProject($this);
        }
        return $this;
    }

    public function removeTicket(Ticket $ticket): static
    {
        if ($this->tickets->removeElement($ticket)) {
            if ($ticket->getProject() === $this) {
                $ticket->setProject(null);
            }
        }
        return $this;
    }

    public function getProjectMembers(): Collection
    {
        return $this->projectMembers;
    }

    public function addProjectMember(ProjectMember $projectMember): static
    {
        if (!$this->projectMembers->contains($projectMember)) {
            $this->projectMembers->add($projectMember);
            $projectMember->setProject($this);
        }
        return $this;
    }

    public function removeProjectMember(ProjectMember $projectMember): static
    {
        if ($this->projectMembers->removeElement($projectMember)) {
            if ($projectMember->getProject() === $this) {
                $projectMember->setProject(null);
            }
        }
        return $this;
    }

    public function getProjectInvitations(): Collection
    {
        return $this->projectInvitations;
    }

    public function addProjectInvitation(ProjectInvitation $projectInvitation): static
    {
        if (!$this->projectInvitations->contains($projectInvitation)) {
            $this->projectInvitations->add($projectInvitation);
            $projectInvitation->setProject($this);
        }
        return $this;
    }

    public function removeProjectInvitation(ProjectInvitation $projectInvitation): static
    {
        if ($this->projectInvitations->removeElement($projectInvitation)) {
            if ($projectInvitation->getProject() === $this) {
                $projectInvitation->setProject(null);
            }
        }
        return $this;
    }
}