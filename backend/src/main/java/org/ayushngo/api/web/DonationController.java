package org.ayushngo.api.web;

import jakarta.servlet.http.HttpServletRequest;
import org.ayushngo.api.dto.ApiDtos;
import org.ayushngo.api.model.Donation;
import org.ayushngo.api.model.UserAccount;
import org.ayushngo.api.repository.DonationRepository;
import org.ayushngo.api.service.ApiException;
import org.ayushngo.api.service.CurrentAccountService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class DonationController {
    private final DonationRepository donations;
    private final CurrentAccountService currentAccount;

    public DonationController(DonationRepository donations, CurrentAccountService currentAccount) {
        this.donations = donations;
        this.currentAccount = currentAccount;
    }

    @PostMapping("/api/donate")
    public void create() {
        throw ApiException.unavailable("Online donations are not available. No payment has been taken.");
    }

    @GetMapping("/api/donations/me")
    public DonationList list(HttpServletRequest request) {
        UserAccount user = currentAccount.require(request);
        List<ApiDtos.DonationResponse> items = donations.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(donation -> new ApiDtos.DonationResponse(donation.getId(),
                        donation.getProjectName(), donation.getAmount(), donation.getCurrency(),
                        donation.getFrequency().name(), donation.getStatus().name(),
                        donation.getCreatedAt(), donation.getPaidAt())).toList();
        return new DonationList(true, items);
    }

    @GetMapping("/api/donations/me/summary")
    public ApiDtos.DonationSummary summary(HttpServletRequest request) {
        UserAccount user = currentAccount.require(request);
        List<ApiDtos.CurrencyTotal> totals = donations.successfulTotalsForUser(user.getId(), Donation.Status.SUCCEEDED)
                .stream().map(total -> new ApiDtos.CurrencyTotal(total.getCurrency(), total.getTotal())).toList();
        Donation latest = donations.findFirstByUserIdAndStatusOrderByPaidAtDesc(user.getId(), Donation.Status.SUCCEEDED)
                .orElse(null);
        List<ApiDtos.MonthlyTotal> monthly = donations.monthlyTotalsForUser(user.getId())
                .stream().map(total -> new ApiDtos.MonthlyTotal(total.getMonth(), total.getCurrency(), total.getTotal())).toList();
        long count = donations.countByUserIdAndStatus(user.getId(), Donation.Status.SUCCEEDED);
        return new ApiDtos.DonationSummary(totals, count,
                latest == null ? null : latest.getAmount(), latest == null ? null : latest.getCurrency(),
                latest == null ? null : latest.getPaidAt(), monthly);
    }

    public record DonationList(boolean success, List<ApiDtos.DonationResponse> items) { }
}
