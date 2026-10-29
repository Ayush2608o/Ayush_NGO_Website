package org.ayushngo.api.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "volunteer_applications")
public class VolunteerApplication {
    @Id @GeneratedValue(strategy = GenerationType.UUID) @Column(columnDefinition = "BINARY(16)")
    private UUID id;
    @Column(nullable = false, length = 120) private String name;
    @Column(nullable = false, length = 254) private String email;
    @Column(nullable = false, length = 40) private String phone;
    @Column(nullable = false, length = 120) private String skill;
    @Column(nullable = false, length = 120) private String city;
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false) private Instant createdAt;
    protected VolunteerApplication() { }
    public VolunteerApplication(String name, String email, String phone, String skill, String city) {
        this.name = name; this.email = email; this.phone = phone; this.skill = skill; this.city = city;
    }
}
