package org.ayushngo.api.web;

import org.ayushngo.api.repository.DonationRepository;
import org.ayushngo.api.service.ApiException;
import org.ayushngo.api.service.CurrentAccountService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verifyNoInteractions;

class DonationControllerTests {
    private final DonationRepository donations = mock(DonationRepository.class);
    private final CurrentAccountService currentAccount = mock(CurrentAccountService.class);
    private final DonationController controller = new DonationController(donations, currentAccount);

    @Test
    void donationRequestIsRejectedWithoutSavingAnythingUntilPaymentsAreConfigured() {
        ApiException error = assertThrows(ApiException.class, controller::create);

        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, error.getStatus());
        assertEquals("Online donations are not available. No payment has been taken.", error.getMessage());
        verifyNoInteractions(donations, currentAccount);
    }
}
