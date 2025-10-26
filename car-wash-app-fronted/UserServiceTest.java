package com.carWash.user_service;

import com.carWash.user_service.model.User;
import com.carWash.user_service.repository.UserRepository;
import com.carWash.user_service.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private User testWasher;
    private User testCustomer;

    @BeforeEach
    void setUp() {
        testUser = new User();
        testUser.setId("test-id");
        testUser.setFullName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("password123");
        testUser.setRole("CUSTOMER");
        testUser.setPhone("1234567890");
        testUser.setActive(true);
        testUser.setReviewsGiven(new ArrayList<>());
        testUser.setReviewsReceived(new ArrayList<>());

        testWasher = new User();
        testWasher.setId("washer-id");
        testWasher.setFullName("Test Washer");
        testWasher.setEmail("washer@example.com");
        testWasher.setPassword("password123");
        testWasher.setRole("WASHER");
        testWasher.setServiceStatus("OFFLINE");
        testWasher.setReviewsGiven(new ArrayList<>());
        testWasher.setReviewsReceived(new ArrayList<>());

        testCustomer = new User();
        testCustomer.setId("customer-id");
        testCustomer.setFullName("Test Customer");
        testCustomer.setEmail("customer@example.com");
        testCustomer.setPassword("password123");
        testCustomer.setRole("CUSTOMER");
        testCustomer.setReviewsGiven(new ArrayList<>());
        testCustomer.setReviewsReceived(new ArrayList<>());
    }

    // ========== REGISTER USER TESTS ==========
    @Test
    @DisplayName("Should register user successfully with valid data")
    void registerUser_ValidUser_Success() {
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.registerUser(testUser);

        assertNotNull(result);
        assertEquals(testUser.getEmail(), result.getEmail());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should throw exception when user is null")
    void registerUser_NullUser_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.registerUser(null)
        );
        assertEquals("User cannot be null", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when email is null")
    void registerUser_NullEmail_ThrowsException() {
        testUser.setEmail(null);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.registerUser(testUser)
        );
        assertEquals("Email cannot be null or empty", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when email is empty")
    void registerUser_EmptyEmail_ThrowsException() {
        testUser.setEmail("   ");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.registerUser(testUser)
        );
        assertEquals("Email cannot be null or empty", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when full name is null")
    void registerUser_NullFullName_ThrowsException() {
        testUser.setFullName(null);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.registerUser(testUser)
        );
        assertEquals("Full name cannot be null or empty", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when password is null")
    void registerUser_NullPassword_ThrowsException() {
        testUser.setPassword(null);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.registerUser(testUser)
        );
        assertEquals("Password cannot be null or empty", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when role is null")
    void registerUser_NullRole_ThrowsException() {
        testUser.setRole(null);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.registerUser(testUser)
        );
        assertEquals("Role cannot be null or empty", exception.getMessage());
    }

    // ========== GET USER BY EMAIL TESTS ==========
    @Test
    @DisplayName("Should return user when email exists")
    void getUserByEmail_ExistingEmail_ReturnsUser() {
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.getUserByEmail("test@example.com");

        assertTrue(result.isPresent());
        assertEquals(testUser.getEmail(), result.get().getEmail());
    }

    @Test
    @DisplayName("Should return empty when email does not exist")
    void getUserByEmail_NonExistingEmail_ReturnsEmpty() {
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        Optional<User> result = userService.getUserByEmail("nonexistent@example.com");

        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("Should throw exception when email is null")
    void getUserByEmail_NullEmail_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.getUserByEmail(null)
        );
        assertEquals("Email cannot be null or empty", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when email is empty")
    void getUserByEmail_EmptyEmail_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.getUserByEmail("   ")
        );
        assertEquals("Email cannot be null or empty", exception.getMessage());
    }

    // ========== UPDATE USER TESTS ==========
    @Test
    @DisplayName("Should update user successfully")
    void updateUser_ValidUser_Success() {
        when(userRepository.existsById("test-id")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.updateUser(testUser);

        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        verify(userRepository).save(testUser);
    }

    @Test
    @DisplayName("Should throw exception when user is null")
    void updateUser_NullUser_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateUser(null)
        );
        assertEquals("User cannot be null", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when user ID is null")
    void updateUser_NullId_ThrowsException() {
        testUser.setId(null);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateUser(testUser)
        );
        assertEquals("User ID cannot be null or empty", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when user does not exist")
    void updateUser_NonExistentUser_ThrowsException() {
        when(userRepository.existsById("test-id")).thenReturn(false);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateUser(testUser)
        );
        assertEquals("User not found", exception.getMessage());
    }

    // ========== GET USER BY ID TESTS ==========
    @Test
    @DisplayName("Should return user when ID exists")
    void getUserById_ExistingId_ReturnsUser() {
        when(userRepository.findById("test-id")).thenReturn(Optional.of(testUser));

        Optional<User> result = userService.getUserById("test-id");

        assertTrue(result.isPresent());
        assertEquals(testUser.getId(), result.get().getId());
    }

    @Test
    @DisplayName("Should return empty when ID does not exist")
    void getUserById_NonExistingId_ReturnsEmpty() {
        when(userRepository.findById("nonexistent-id")).thenReturn(Optional.empty());

        Optional<User> result = userService.getUserById("nonexistent-id");

        assertFalse(result.isPresent());
    }

    @Test
    @DisplayName("Should throw exception when ID is null")
    void getUserById_NullId_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.getUserById(null)
        );
        assertEquals("User ID cannot be null or empty", exception.getMessage());
    }

    // ========== GET USERS BY ROLE TESTS ==========
    @Test
    @DisplayName("Should return users by role")
    void getUsersByRole_ValidRole_ReturnsUsers() {
        List<User> customers = Arrays.asList(testUser, testCustomer);
        when(userRepository.findByRole("CUSTOMER")).thenReturn(customers);

        List<User> result = userService.getUsersByRole("CUSTOMER");

        assertEquals(2, result.size());
        assertTrue(result.stream().allMatch(u -> "CUSTOMER".equals(u.getRole())));
    }

    @Test
    @DisplayName("Should return empty list when no users found for role")
    void getUsersByRole_NoUsersFound_ReturnsEmptyList() {
        when(userRepository.findByRole("ADMIN")).thenReturn(new ArrayList<>());

        List<User> result = userService.getUsersByRole("ADMIN");

        assertTrue(result.isEmpty());
    }

    @Test
    @DisplayName("Should throw exception when role is null")
    void getUsersByRole_NullRole_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.getUsersByRole(null)
        );
        assertEquals("Role cannot be null or empty", exception.getMessage());
    }

    // ========== UPLOAD PROFILE PICTURE TESTS ==========
    @Test
    @DisplayName("Should upload profile picture successfully")
    void uploadProfilePicture_ValidFile_Success() throws IOException {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getContentType()).thenReturn("image/jpeg");
        when(multipartFile.getSize()).thenReturn(1024L);
        when(multipartFile.getOriginalFilename()).thenReturn("profile.jpg");
        when(multipartFile.getInputStream()).thenReturn(new ByteArrayInputStream("test".getBytes()));
        when(userRepository.findById("test-id")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        String result = userService.uploadProfilePicture(multipartFile, "test-id");

        assertNotNull(result);
        assertTrue(result.startsWith("/Uploads/"));
        assertTrue(result.contains("profile.jpg"));
        verify(userRepository).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when file is null")
    void uploadProfilePicture_NullFile_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.uploadProfilePicture(null, "test-id")
        );
        assertEquals("File cannot be null or empty", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when file is empty")
    void uploadProfilePicture_EmptyFile_ThrowsException() {
        when(multipartFile.isEmpty()).thenReturn(true);

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.uploadProfilePicture(multipartFile, "test-id")
        );
        assertEquals("File cannot be null or empty", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void uploadProfilePicture_UserNotFound_ThrowsException() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(userRepository.findById("test-id")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.uploadProfilePicture(multipartFile, "test-id")
        );
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when file is not an image")
    void uploadProfilePicture_NonImageFile_ThrowsException() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getContentType()).thenReturn("text/plain");
        when(userRepository.findById("test-id")).thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.uploadProfilePicture(multipartFile, "test-id")
        );
        assertEquals("File must be an image", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when file size exceeds limit")
    void uploadProfilePicture_FileSizeExceedsLimit_ThrowsException() {
        when(multipartFile.isEmpty()).thenReturn(false);
        when(multipartFile.getContentType()).thenReturn("image/jpeg");
        when(multipartFile.getSize()).thenReturn(6 * 1024 * 1024L); // 6MB
        when(userRepository.findById("test-id")).thenReturn(Optional.of(testUser));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.uploadProfilePicture(multipartFile, "test-id")
        );
        assertEquals("File size exceeds 5MB limit", exception.getMessage());
    }

    // ========== ADD WASHER REVIEW TESTS ==========
    @Test
    @DisplayName("Should add washer review successfully")
    void addWasherReview_ValidData_Success() {
        when(userRepository.findById("washer-id")).thenReturn(Optional.of(testWasher));
        when(userRepository.findById("customer-id")).thenReturn(Optional.of(testCustomer));

        userService.addWasherReview("washer-id", "customer-id", "review-id");

        assertTrue(testWasher.getReviewsGiven().contains("review-id"));
        assertTrue(testCustomer.getReviewsReceived().contains("review-id"));
        verify(userRepository, times(2)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when washer not found")
    void addWasherReview_WasherNotFound_ThrowsException() {
        when(userRepository.findById("washer-id")).thenReturn(Optional.empty());
        when(userRepository.findById("customer-id")).thenReturn(Optional.of(testCustomer));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.addWasherReview("washer-id", "customer-id", "review-id")
        );
        assertEquals("Washer or customer not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when user is not a washer")
    void addWasherReview_UserNotWasher_ThrowsException() {
        testWasher.setRole("CUSTOMER");
        when(userRepository.findById("washer-id")).thenReturn(Optional.of(testWasher));
        when(userRepository.findById("customer-id")).thenReturn(Optional.of(testCustomer));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.addWasherReview("washer-id", "customer-id", "review-id")
        );
        assertEquals("User is not a washer", exception.getMessage());
    }

    // ========== ADD CUSTOMER REVIEW TESTS ==========
    @Test
    @DisplayName("Should add customer review successfully")
    void addCustomerReview_ValidData_Success() {
        when(userRepository.findById("customer-id")).thenReturn(Optional.of(testCustomer));
        when(userRepository.findById("washer-id")).thenReturn(Optional.of(testWasher));

        userService.addCustomerReview("customer-id", "washer-id", "review-id");

        assertTrue(testCustomer.getReviewsGiven().contains("review-id"));
        assertTrue(testWasher.getReviewsReceived().contains("review-id"));
        verify(userRepository, times(2)).save(any(User.class));
    }

    @Test
    @DisplayName("Should throw exception when customer not found")
    void addCustomerReview_CustomerNotFound_ThrowsException() {
        when(userRepository.findById("customer-id")).thenReturn(Optional.empty());
        when(userRepository.findById("washer-id")).thenReturn(Optional.of(testWasher));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.addCustomerReview("customer-id", "washer-id", "review-id")
        );
        assertEquals("Customer or washer not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when user is not a customer")
    void addCustomerReview_UserNotCustomer_ThrowsException() {
        testCustomer.setRole("WASHER");
        when(userRepository.findById("customer-id")).thenReturn(Optional.of(testCustomer));
        when(userRepository.findById("washer-id")).thenReturn(Optional.of(testWasher));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.addCustomerReview("customer-id", "washer-id", "review-id")
        );
        assertEquals("User is not a customer", exception.getMessage());
    }

    // ========== UPDATE SERVICE STATUS TESTS ==========
    @Test
    @DisplayName("Should update service status to ONLINE successfully")
    void updateServiceStatus_ValidStatusOnline_Success() {
        when(userRepository.findById("washer-id")).thenReturn(Optional.of(testWasher));
        when(userRepository.save(any(User.class))).thenReturn(testWasher);

        User result = userService.updateServiceStatus("washer-id", "ONLINE");

        assertEquals("ONLINE", result.getServiceStatus());
        verify(userRepository).save(testWasher);
    }

    @Test
    @DisplayName("Should update service status to OFFLINE successfully")
    void updateServiceStatus_ValidStatusOffline_Success() {
        when(userRepository.findById("washer-id")).thenReturn(Optional.of(testWasher));
        when(userRepository.save(any(User.class))).thenReturn(testWasher);

        User result = userService.updateServiceStatus("washer-id", "OFFLINE");

        assertEquals("OFFLINE", result.getServiceStatus());
        verify(userRepository).save(testWasher);
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void updateServiceStatus_UserNotFound_ThrowsException() {
        when(userRepository.findById("washer-id")).thenReturn(Optional.empty());

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateServiceStatus("washer-id", "ONLINE")
        );
        assertEquals("User not found", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when user is not a washer")
    void updateServiceStatus_UserNotWasher_ThrowsException() {
        testWasher.setRole("CUSTOMER");
        when(userRepository.findById("washer-id")).thenReturn(Optional.of(testWasher));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateServiceStatus("washer-id", "ONLINE")
        );
        assertEquals("Service status is only for washers", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when status is invalid")
    void updateServiceStatus_InvalidStatus_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateServiceStatus("washer-id", "INVALID")
        );
        assertEquals("Service status must be ONLINE or OFFLINE", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when status is null")
    void updateServiceStatus_NullStatus_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateServiceStatus("washer-id", null)
        );
        assertEquals("Service status cannot be null or empty", exception.getMessage());
    }

    @Test
    @DisplayName("Should throw exception when user ID is null")
    void updateServiceStatus_NullUserId_ThrowsException() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.updateServiceStatus(null, "ONLINE")
        );
        assertEquals("User ID cannot be null or empty", exception.getMessage());
    }

    // ========== EDGE CASE TESTS ==========
    @Test
    @DisplayName("Should handle whitespace-only strings as empty")
    void registerUser_WhitespaceOnlyFields_ThrowsException() {
        testUser.setFullName("   ");

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> userService.registerUser(testUser)
        );
        assertEquals("Full name cannot be null or empty", exception.getMessage());
    }

    @Test
    @DisplayName("Should handle repository save failure gracefully")
    void registerUser_RepositoryFailure_ThrowsException() {
        when(userRepository.save(any(User.class))).thenThrow(new RuntimeException("Database error"));

        RuntimeException exception = assertThrows(
                RuntimeException.class,
                () -> userService.registerUser(testUser)
        );
        assertEquals("Database error", exception.getMessage());
    }

    @Test
    @DisplayName("Should handle concurrent review additions")
    void addWasherReview_ConcurrentAccess_Success() {
        when(userRepository.findById("washer-id")).thenReturn(Optional.of(testWasher));
        when(userRepository.findById("customer-id")).thenReturn(Optional.of(testCustomer));

        // Simulate concurrent additions
        userService.addWasherReview("washer-id", "customer-id", "review-1");
        userService.addWasherReview("washer-id", "customer-id", "review-2");

        assertEquals(2, testWasher.getReviewsGiven().size());
        assertEquals(2, testCustomer.getReviewsReceived().size());
        verify(userRepository, times(4)).save(any(User.class));
    }
}