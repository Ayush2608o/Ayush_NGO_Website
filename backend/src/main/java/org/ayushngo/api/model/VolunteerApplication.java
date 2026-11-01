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
    @Column(nullable = false, length = 120) private String city;
    @Column(length = 120) private String state;
    private Short age;
    @Column(length = 160) private String occupation;
    @Column(nullable = false, length = 500) private String skill;
    @Column(name = "areas_of_interest", length = 1000) private String areasOfInterest;
    @Column(length = 200) private String availability;
    @Column(length = 16) private String preference;
    @Column(length = 2000) private String motivation;
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false) private Instant createdAt;
    protected VolunteerApplication() { }
    public VolunteerApplication(String name, String email, String phone, String city, String state,
                                Integer age, String occupation, String skill, String areasOfInterest,
                                String availability, String preference, String motivation) {
        this.name = name; this.email = email; this.phone = phone; this.city = city; this.state = state;
        this.age = age == null ? null : age.shortValue(); this.occupation = occupation; this.skill = skill; this.areasOfInterest = areasOfInterest;
        this.availability = availability; this.preference = preference; this.motivation = motivation;
    }
}
