package org.ayushngo.api.repository;

import org.ayushngo.api.model.VolunteerApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface VolunteerApplicationRepository extends JpaRepository<VolunteerApplication, UUID> { }
