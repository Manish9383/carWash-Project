import { Component, OnInit, inject, ChangeDetectorRef, ViewEncapsulation, ViewChild, TemplateRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule, DatePipe } from '@angular/common';
import { UserService, User, UsersResponse } from '../../services/user.service';
import { BookingService, Booking, ServicePlan, AddOn } from '../../services/booking.service';
import { ReviewService, Review } from '../../services/review.service';
import { PromoCodeService, PromoCode } from '../../services/promo-code.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun } from 'docx';
import { EditWasherDialogComponent } from '../../edit-washer-dialog/edit-washer-dialog.component';
import { ViewReviewsDialogComponent } from '../../view-reviews-dialog/view-reviews-dialog.component';
import { EditPromoCodeDialogComponent } from '../../edit-promo-code-dialog/edit-promo-code-dialog.component';
import { EditServicePlanDialogComponent } from '../../edit-service-plan-dialog/edit-service-plan-dialog.component';
import { EditAddOnDialogComponent } from '../../edit-add-on-dialog/edit-add-on-dialog.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatTooltipModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatDatepickerModule,
    MatNativeDateModule,
  ],
  providers: [DatePipe, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss'],
})
export class AdminDashboardComponent implements OnInit {
  @ViewChild('addServicePlanDialog') addServicePlanDialogTemplate!: TemplateRef<any>;
  addServicePlanDialogRef: any;

  openAddServicePlanDialog() {
    this.addServicePlanForm.reset();
    this.errorMessage = null;
    this.successMessage = null;
    this.addServicePlanDialogRef = this.dialog.open(this.addServicePlanDialogTemplate, {
      width: '420px',
      panelClass: 'add-on-dialog-panel',
      disableClose: true,
    });
  }

  closeAddServicePlanDialog() {
    if (this.addServicePlanDialogRef) {
      this.addServicePlanDialogRef.close();
    }
  }
  @ViewChild('addAddOnDialog') addAddOnDialogTemplate!: TemplateRef<any>;
  addAddOnDialogRef: any;

  openAddAddOnDialog() {
    this.addAddOnForm.reset();
    this.errorMessage = null;
    this.successMessage = null;
    this.addAddOnDialogRef = this.dialog.open(this.addAddOnDialogTemplate, {
      width: '420px',
      panelClass: 'add-on-dialog-panel',
      disableClose: true,
    });
  }

  closeAddAddOnDialog() {
    if (this.addAddOnDialogRef) {
      this.addAddOnDialogRef.close();
    }
  }
  private snackBar = inject(MatSnackBar);


  private userService = inject(UserService);
  private bookingService = inject(BookingService);
  private reviewService = inject(ReviewService);
  private promoCodeService = inject(PromoCodeService);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private dialog = inject(MatDialog);
  private datePipe = inject(DatePipe);
  // mat-select removed: using inline dropdown instead

  washers = new MatTableDataSource<User>([]);
  filteredWashers = new MatTableDataSource<User>([]);
  customers = new MatTableDataSource<User>([]);
  filteredCustomers = new MatTableDataSource<User>([]);
  bookings = new MatTableDataSource<Booking>([]);
  filteredBookings = new MatTableDataSource<Booking>([]);
  promoCodes = new MatTableDataSource<PromoCode>([]);
  filteredPromoCodes = new MatTableDataSource<PromoCode>([]);
  servicePlans = new MatTableDataSource<ServicePlan>([]);
  filteredServicePlans = new MatTableDataSource<ServicePlan>([]);
  addOns = new MatTableDataSource<AddOn>([]);
  filteredAddOns = new MatTableDataSource<AddOn>([]);
  displayedWasherColumns: string[] = ['id', 'fullName', 'email', 'phone', 'serviceStatus', 'active', 'actions'];
  displayedCustomerColumns: string[] = ['id', 'fullName', 'email', 'phone', 'active', 'actions'];
  displayedBookingColumns: string[] = ['id', 'userId', 'customerName', 'carId', 'washPackage', 'status', 'totalAmount', 'scheduledTime', 'washerId', 'actions'];
  displayedPromoCodeColumns: string[] = ['id', 'code', 'discountType', 'discountValue', 'active', 'expiryDate', 'maxUses', 'currentUses', 'actions'];
  displayedServicePlanColumns: string[] = ['id', 'name', 'price', 'active', 'actions'];
  displayedAddOnColumns: string[] = ['id', 'name', 'price', 'active', 'actions'];
  addWasherForm: FormGroup;
  assignOrderForm: FormGroup;
  addServicePlanForm: FormGroup;
  addAddOnForm: FormGroup;
  reportForm: FormGroup;
  activeTab: string = 'customers';
  showAddWasherForm: boolean = false;
  showAddPromoCodeForm: boolean = false;
  showAddServicePlanForm: boolean = false;
  showAddAddOnForm: boolean = false;
  // New UI state for Orders page
  showAssignPanel: boolean = false;
  selectedBooking: Booking | null = null;
  showReportFilters: boolean = false;
  isLoading: boolean = false;
  isLoadingWashers: boolean = false;
  loadingAssign: { [key: string]: boolean } = {};
  errorMessage: string | null = null;
  successMessage: string | null = null;
  // track last action so success messages can be scoped
  lastAction: 'assign' | 'report' | null = null;
  customerSearchTerm: string = '';
  washerSearchTerm: string = '';
  promoCodeSearchTerm: string = '';
  servicePlanSearchTerm: string = '';
  addOnSearchTerm: string = '';
  // Inline dropdown state for washer selection
  washerDropdownOpen: boolean = false;
  washerDropdownSearch: string = '';

  constructor() {
    this.washers.data = [];
    this.filteredWashers.data = [];
    this.customers.data = [];
    this.filteredCustomers.data = [];
    this.bookings.data = [];
    this.filteredBookings.data = [];
    this.promoCodes.data = [];
    this.filteredPromoCodes.data = [];
    this.servicePlans.data = [];
    this.filteredServicePlans.data = [];
    this.addOns.data = [];
    this.filteredAddOns.data = [];

    this.addWasherForm = this.fb.group({
      fullName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      phone: ['', [Validators.pattern(/^\d{10}$/)]],
    });

    // Initialize washerId as disabled to avoid DOM "changed after checked" issues
    this.assignOrderForm = this.fb.group({
      bookingId: ['', Validators.required],
      washerId: [{ value: '', disabled: true }, Validators.required],
    });

    this.addServicePlanForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
    });

    this.addAddOnForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
    });

    this.reportForm = this.fb.group({
  orderNumber: [''],
  washerName: [''],
  status: [''],
  washPackage: [''],
  startDate: [null],
  endDate: [null],
    });
  }

  // Typed getter for template formControl binding to avoid null/undefined type
  get orderNumberControl(): FormControl {
    return this.reportForm.get('orderNumber') as FormControl;
  }

  ngOnInit() {
    this.loadCustomers();
    this.loadWashers();
    this.loadOrders();
    this.loadPromoCodes();
    this.loadServicePlans();
    this.loadAddOns();
    this.loadFilteredBookings();

    this.reportForm.valueChanges.subscribe(() => {
      this.loadFilteredBookings();
    });
  }

  // Generic alphabetical sort helper. Tries fullName, then name, then code, then email as fallbacks.
  private sortByNameArray<T>(arr: T[], nameGetter?: (item: T) => string): T[] {
    if (!arr) return arr || [];
    return arr.sort((a: T, b: T) => {
      const getName = (x: T) => {
        if (nameGetter) return (nameGetter(x) || '').toString().toLowerCase();
        const anyX: any = x as any;
        return (anyX.fullName || anyX.name || anyX.code || anyX.email || '').toString().toLowerCase();
      };
      const A = getName(a);
      const B = getName(b);
      return A.localeCompare(B);
    });
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return this.datePipe.transform(date, 'MMMM d, yyyy, h:mm a') || 'N/A';
  }
  getCustomerName(userId: string): string {
    const customer = this.customers.data.find(c => c.id === userId);
    return customer ? customer.fullName : 'Unknown';
  }

  getCustomerProfile(userId: string): string | null {
    const customer = this.customers.data.find(c => c.id === userId);
    return customer ? (customer.profilePicture || null) : null;
  }

  getWasherName(washerId: string): string | undefined {
    const washer = this.washers.data.find(w => w.id === washerId);
    return washer ? washer.fullName : undefined;
  }

  // Open assign panel and ensure washers list is loaded
  openAssignPanel(booking: Booking) {
    this.errorMessage = null;
    this.successMessage = null;
    this.selectedBooking = booking;
    this.showAssignPanel = true;
    // Ensure washers are up to date before selecting
    this.loadWashers();
    // patch booking id into form
    if (this.assignOrderForm) {
      this.assignOrderForm.patchValue({ bookingId: booking.id });
    }
    this.cdr.detectChanges();
  }

  // patch washer selection and if a booking is already selected auto-submit assignment
  selectWasherAndMaybeAssign(washerId: string) {
    this.lastAction = null;
    if (this.assignOrderForm) {
      this.assignOrderForm.patchValue({ washerId });
    }
    // if booking is already selected, auto-submit for convenience
    const bookingId = this.assignOrderForm?.value?.bookingId;
    if (bookingId) {
      // small delay to allow form state to settle visually
      setTimeout(() => this.assignOrder(), 100);
    }
  }

  loadCustomers() {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.userService.getUsersByRole('CUSTOMER').subscribe({
      next: (data: UsersResponse) => {
        console.log('Raw customers:', JSON.stringify(data, null, 2));
        this.customers.data = data.users.map(customer => ({
          id: customer.id,
          fullName: customer.fullName || 'N/A',
          email: customer.email,
          phone: customer.phone || '',
          role: customer.role,
          active: customer.active ?? true,
          serviceStatus: customer.serviceStatus || undefined,
          profilePicture: customer.profilePicture,
          reviewsGiven: customer.reviewsGiven || [],
          reviewsReceived: customer.reviewsReceived || [],
        }));
  this.filteredCustomers.data = this.sortByNameArray(this.customers.data as any[]);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading customers:', err);
        this.customers.data = [];
        this.filteredCustomers.data = [];
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadWashers() {
    // only mark washers-subfetch flag so whole page doesn't go into loading overlay
    this.isLoadingWashers = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.userService.getUsersByRole('WASHER').subscribe({
      next: (data: UsersResponse) => {
        console.log('Raw washers:', JSON.stringify(data, null, 2));
        this.washers.data = data.users.map(washer => ({
          id: washer.id,
          fullName: washer.fullName || 'N/A',
          email: washer.email,
          phone: washer.phone || '',
          role: washer.role,
          active: washer.active ?? true,
          serviceStatus: washer.serviceStatus || 'OFFLINE',
          profilePicture: washer.profilePicture,
          reviewsGiven: washer.reviewsGiven || [],
          reviewsReceived: washer.reviewsReceived || [],
        }));
  this.filteredWashers.data = this.sortByNameArray(this.washers.data as any[]);
        this.isLoadingWashers = false;
        // Enable washerId control only when washers are loaded and at least one washer exists
        const washerControl = this.assignOrderForm.get('washerId');
        if (washerControl) {
          if (this.washers.data && this.washers.data.length > 0) {
            washerControl.enable({ emitEvent: false });
          } else {
            washerControl.disable({ emitEvent: false });
          }
        }
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading washers:', err);
        this.washers.data = [];
        this.filteredWashers.data = [];
        this.errorMessage = err.message;
        this.isLoadingWashers = false;
        const washerControlErr = this.assignOrderForm.get('washerId');
        if (washerControlErr) washerControlErr.disable({ emitEvent: false });
        this.cdr.detectChanges();
      },
    });
  }

  loadOrders() {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.bookingService.getAllBookings().subscribe({
      next: (data: Booking[]) => {
        console.log('Raw bookings:', JSON.stringify(data, null, 2));
        this.bookings.data = data.map(booking => ({
          ...booking,
          totalAmount: booking.totalAmount ?? 0,
          scheduledTime: booking.scheduledTime || 'N/A',
          washerId: booking.washerId || 'Unassigned',
        }));
        // Sort bookings by customer name where possible
        this.filteredBookings.data = this.sortByNameArray(this.bookings.data as any[], (b: any) => {
          const cust = this.customers.data.find(c => c.id === b.userId);
          return cust ? (cust.fullName || '') : '';
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading bookings:', err);
        this.bookings.data = [];
        this.filteredBookings.data = [];
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadFilteredBookings() {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.bookingService.getAllBookings().subscribe({
      next: (data: Booking[]) => {
        // Debug: Log all booking statuses
        console.log('All booking statuses:', data.map(b => b.status));
        console.log('Raw bookings for filtering:', JSON.stringify(data, null, 2));
  const filters = this.reportForm.value;
  // Normalize search term once for improved performance and consistency
  const orderSearch = (filters.orderNumber || '').toString().trim().toLowerCase();
  console.log('Filtering bookings with filters:', filters, 'normalized search:', orderSearch);
  this.filteredBookings.data = data.filter(booking => {
          let matches = true;
          if (orderSearch) {
            // Match against booking id, car id, customer id and customer name
            const customer = this.customers.data.find(c => c.id === booking.userId);
            const custName = customer ? (customer.fullName || '').toLowerCase() : '';
            const carId = (booking.carId || '').toString().toLowerCase();
            const bookingId = (booking.id || '').toString().toLowerCase();
            const userId = (booking.userId || '').toString().toLowerCase();
            if (!(bookingId.includes(orderSearch) || carId.includes(orderSearch) || userId.includes(orderSearch) || custName.includes(orderSearch))) {
              matches = false;
            }
          }
          if (filters.washerName && booking.washerId) {
            const washer = this.washers.data.find(w => w.id === booking.washerId);
            if (!washer || !washer.fullName.toLowerCase().includes(filters.washerName.toLowerCase())) {
              matches = false;
            }
          }
          if (filters.status && booking.status !== filters.status) {
            matches = false;
          }
          if (filters.washPackage && booking.washPackage.toLowerCase().indexOf(filters.washPackage.toLowerCase()) === -1) {
            matches = false;
          }
          // Parse booking.scheduledTime to Date, handling various formats
          let bookingDate: Date | null = null;
          if (booking.scheduledTime) {
            if (typeof booking.scheduledTime === 'string') {
              const isoDate = Date.parse(booking.scheduledTime);
              if (!isNaN(isoDate)) {
                bookingDate = new Date(isoDate);
              } else {
                bookingDate = new Date(booking.scheduledTime);
              }
            } else {
              bookingDate = new Date(booking.scheduledTime);
            }
          }
          // Ensure filters.startDate and filters.endDate are Date objects
          let startDate: Date | null = null;
          let endDate: Date | null = null;
          if (filters.startDate) {
            startDate = filters.startDate instanceof Date ? filters.startDate : new Date(filters.startDate);
          }
          if (filters.endDate) {
            endDate = filters.endDate instanceof Date ? filters.endDate : new Date(filters.endDate);
          }
          if (startDate && bookingDate && startDate > bookingDate) {
            matches = false;
          }
          if (endDate && bookingDate && endDate < bookingDate) {
            matches = false;
          }
          return matches;
        }).map(booking => ({
          ...booking,
          totalAmount: booking.totalAmount ?? 0,
          scheduledTime: booking.scheduledTime || 'N/A',
          washerId: booking.washerId || 'Unassigned',
        }));
        // Ensure filtered list is alphabetical by customer name
        this.filteredBookings.data = this.sortByNameArray(this.filteredBookings.data as any[], (b: any) => {
          const cust = this.customers.data.find(c => c.id === b.userId);
          return cust ? (cust.fullName || '') : '';
        });
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading filtered bookings:', err);
        this.filteredBookings.data = [];
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  generateFilteredReport() {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    const bookings = this.filteredBookings.data;
    console.log('Generating report for filtered bookings:', bookings);

    if (!bookings || bookings.length === 0) {
      this.errorMessage = 'No bookings found for the selected filters.';
      this.isLoading = false;
      this.cdr.detectChanges();
      return;
    }

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Filtered Bookings Report',
                  bold: true,
                  size: 24,
                }),
              ],
            }),
            new Paragraph({
              children: [new TextRun(`Generated on: ${this.datePipe.transform(new Date(), 'MMMM d, yyyy, h:mm a')}`)],
            }),
            new Paragraph({ text: '' }),
            new Table({
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph('Booking ID')] }),
                    new TableCell({ children: [new Paragraph('Customer ID')] }),
                    new TableCell({ children: [new Paragraph('Customer Name')] }),
                    new TableCell({ children: [new Paragraph('Car ID')] }),
                    new TableCell({ children: [new Paragraph('Wash Package')] }),
                    new TableCell({ children: [new Paragraph('Status')] }),
                    new TableCell({ children: [new Paragraph('Total Amount')] }),
                    new TableCell({ children: [new Paragraph('Scheduled Time')] }),
                    new TableCell({ children: [new Paragraph('Washer')] }),
                  ],
                }),
                ...bookings.map(booking => {
                  const washer = booking.washerId !== 'Unassigned' ? this.washers.data.find(w => w.id === booking.washerId) : null;
                  const customer = this.customers.data.find(c => c.id === booking.userId);
                  return new TableRow({
                    children: [
                      new TableCell({ children: [new Paragraph(booking.id)] }),
                      new TableCell({ children: [new Paragraph(booking.userId)] }),
                      new TableCell({ children: [new Paragraph(customer ? customer.fullName : 'Unknown')] }),
                      new TableCell({ children: [new Paragraph(booking.carId)] }),
                      new TableCell({ children: [new Paragraph(booking.washPackage)] }),
                      new TableCell({ children: [new Paragraph(booking.status)] }),
                      new TableCell({ children: [new Paragraph(booking.totalAmount?.toString() || 'N/A')] }),
                      new TableCell({ children: [new Paragraph(this.formatDate(booking.scheduledTime))] }),
                      new TableCell({ children: [new Paragraph(washer ? washer.fullName : 'Unassigned')] }),
                    ],
                  });
                }),
              ],
            }),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      console.log('Saving report as Filtered_Bookings_Report.docx');
      saveAs(blob, `Filtered_Bookings_Report_${new Date().toISOString().split('T')[0]}.docx`);
      this.successMessage = 'Report generated successfully!';
      this.isLoading = false;
      this.cdr.detectChanges();
    }).catch((err) => {
      console.error('Error generating .docx:', err);
      this.errorMessage = 'Failed to generate report: Error creating document';
      this.isLoading = false;
      this.cdr.detectChanges();
    });
  }

  loadPromoCodes() {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.promoCodeService.getPromoCodes().subscribe({
      next: (data: PromoCode[]) => {
        console.log('Raw promo codes:', JSON.stringify(data, null, 2));
  this.promoCodes.data = data.map(promo => ({
          id: promo.id,
          code: promo.code,
          discountType: promo.discountType,
          discountValue: promo.discountValue,
          active: promo.active,
          expiryDate: promo.expiryDate || undefined,
          maxUses: promo.maxUses || undefined,
          currentUses: promo.currentUses || 0,
        }));
  this.filteredPromoCodes.data = this.sortByNameArray(this.promoCodes.data as any[]);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading promo codes:', err);
        this.promoCodes.data = [];
        this.filteredPromoCodes.data = [];
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadServicePlans() {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.bookingService.getServicePlans().subscribe({
      next: (data: ServicePlan[]) => {
        console.log('Raw service plans:', JSON.stringify(data, null, 2));
  this.servicePlans.data = data.map(plan => ({
          id: plan.id,
          name: plan.name,
          price: plan.price,
          active: plan.active ?? true,
        }));
  this.filteredServicePlans.data = this.sortByNameArray(this.servicePlans.data as any[]);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading service plans:', err);
        this.servicePlans.data = [];
        this.filteredServicePlans.data = [];
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadAddOns() {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.bookingService.getAddOns().subscribe({
      next: (data: AddOn[]) => {
        console.log('Raw add-ons:', JSON.stringify(data, null, 2));
  this.addOns.data = data.map(addOn => ({
          id: addOn.id,
          name: addOn.name,
          price: addOn.price,
          active: addOn.active ?? true,
        }));
  this.filteredAddOns.data = this.sortByNameArray(this.addOns.data as any[]);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error loading add-ons:', err);
        this.addOns.data = [];
        this.filteredAddOns.data = [];
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleAddWasherForm() {
    // Deprecated: replaced by dialog-based add-washer UI
    this.showAddWasherForm = !this.showAddWasherForm;
    this.errorMessage = null;
    this.successMessage = null;
    if (!this.showAddWasherForm) {
      this.addWasherForm.reset();
    }
    this.cdr.detectChanges();
  }

  openAddWasherDialog() {
    // Lazy-import component to avoid circular references in some build setups
    import('../../add-washer-dialog/add-washer-dialog.component').then(m => {
      const ref = this.dialog.open(m.AddWasherDialogComponent, { panelClass: 'add-washer-dialog-panel' });
      ref.afterClosed().subscribe((result: any) => {
        if (result && result.success) {
          this.successMessage = 'Washer added successfully!';
          // reload washers list to reflect the new entry
          this.loadWashers();
        }
      });
    }).catch(err => console.error('Failed to open AddWasherDialog:', err));
  }

  toggleAddPromoCodeForm() {
    this.showAddPromoCodeForm = !this.showAddPromoCodeForm;
    this.errorMessage = null;
    this.successMessage = null;
    this.cdr.detectChanges();
  }

  toggleAddServicePlanForm() {
    this.showAddServicePlanForm = !this.showAddServicePlanForm;
    this.errorMessage = null;
    this.successMessage = null;
    if (!this.showAddServicePlanForm) {
      this.addServicePlanForm.reset();
    }
    this.cdr.detectChanges();
  }

  toggleAddAddOnForm() {
    this.showAddAddOnForm = !this.showAddAddOnForm;
    this.errorMessage = null;
    this.successMessage = null;
    if (!this.showAddAddOnForm) {
      this.addAddOnForm.reset();
    }
    this.cdr.detectChanges();
  }

  addWasher() {
    if (this.addWasherForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.successMessage = null;
      return;
    }

    if (!this.userService.getCurrentUserRole().includes('ADMIN')) {
      this.errorMessage = 'You must be logged in as an admin to add washers.';
      this.successMessage = null;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    const washerData: Partial<User> = {
      ...this.addWasherForm.value,
      role: 'WASHER',
      active: true,
    };
    console.log('Submitting washer data:', washerData);
    this.userService.createUser(washerData).subscribe({
      next: (response) => {
        console.log('Washer added successfully:', response);
        this.addWasherForm.reset();
        this.showAddWasherForm = false;
        this.successMessage = 'Washer added successfully!';
        this.isLoading = false;
        this.loadWashers();
      },
      error: (err: Error) => {
        console.error('Error adding washer:', err);
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  addServicePlan() {
    if (this.addServicePlanForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.successMessage = null;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    const servicePlanData: Partial<ServicePlan> = {
      ...this.addServicePlanForm.value,
      active: true,
    };
    console.log('Submitting service plan data:', servicePlanData);
    this.bookingService.createServicePlan(servicePlanData).subscribe({
      next: (response: ServicePlan) => {
        console.log('Service plan added successfully:', response);
        this.addServicePlanForm.reset();
        this.showAddServicePlanForm = false;
        this.successMessage = 'Service plan added successfully!';
        this.isLoading = false;
        this.loadServicePlans();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error adding service plan:', err);
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  addAddOn() {
    if (this.addAddOnForm.invalid) {
      this.errorMessage = 'Please fill all required fields correctly.';
      this.successMessage = null;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    const addOnData: Partial<AddOn> = {
      ...this.addAddOnForm.value,
      active: true,
    };
    console.log('Submitting add-on data:', addOnData);
    this.bookingService.createAddOn(addOnData).subscribe({
      next: (response: AddOn) => {
        console.log('Add-on added successfully:', response);
        this.addAddOnForm.reset();
        this.showAddAddOnForm = false;
        this.successMessage = 'Add-on added successfully!';
        this.isLoading = false;
        this.loadAddOns();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error adding add-on:', err);
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }
assignOrder() {
  if (this.assignOrderForm.invalid) {
    this.errorMessage = 'Please select a booking and washer.';
    this.successMessage = null;
    return;
  }

  if (!this.userService.getCurrentUserRole().includes('ADMIN')) {
    this.errorMessage = 'You must be logged in as an admin to assign orders.';
    this.successMessage = null;
    return;
  }

  this.isLoading = true;
  this.errorMessage = null;
  this.successMessage = null;
  const { bookingId, washerId } = this.assignOrderForm.value;
  this.loadingAssign[bookingId] = true;
  console.log('Assigning order:', { bookingId, washerId });
    this.bookingService.assignBooking(bookingId, washerId).subscribe({
    next: () => {
      console.log('Order assigned successfully');
  this.successMessage = 'Order assigned successfully';
  this.lastAction = 'assign';
      try { this.snackBar.open('Order assigned successfully', 'Close', { duration: 3000, panelClass: 'snackbar-success', verticalPosition: 'top' }); } catch (e) {}
      this.assignOrderForm.reset();
      this.isLoading = false;
      this.loadingAssign[bookingId] = false;
      this.showAssignPanel = false;
      this.selectedBooking = null;
      this.loadOrders();
      this.loadFilteredBookings();
      this.cdr.detectChanges();
    },
    error: (err: any) => {
      console.error('Error assigning order:', err);
      let errorMessage = err.error?.message || err.message || 'Failed to assign order';
      if (err.status === 403) {
        errorMessage = 'Permission denied: Ensure you are logged in as an admin and the washer is active.';
      } else if (err.status === 404) {
        errorMessage = 'Booking or washer not found.';
      } else if (err.status === 400) {
        errorMessage = err.error?.error || 'Invalid request: Check booking status or washer availability.';
      }
      this.errorMessage = errorMessage;
      this.isLoading = false;
      this.loadingAssign[bookingId] = false;
      this.cdr.detectChanges();
    },
  });
}

  toggleActive(user: User, role: 'WASHER' | 'CUSTOMER') {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    const updatedUser: Partial<User> = { ...user, active: !user.active };
    console.log(`Toggling active status for ${role.toLowerCase()}:`, user.id);
    this.userService.updateUser(user.id, updatedUser).subscribe({
      next: () => {
        console.log(`${role} status updated:`, updatedUser);
        this.successMessage = `${role} ${user.active ? 'deactivated' : 'activated'} successfully!`;
        this.isLoading = false;
        if (role === 'WASHER') {
          this.loadWashers();
        } else {
          this.loadCustomers();
        }
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error(`Error toggling active status for ${role.toLowerCase()}:`, err);
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  togglePromoCodeStatus(promoCode: PromoCode) {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.promoCodeService.togglePromoCodeStatus(promoCode.id, !promoCode.active).subscribe({
      next: () => {
        console.log(`Promo code ${promoCode.code} status toggled to ${!promoCode.active}`);
        this.successMessage = `Promo code ${promoCode.active ? 'deactivated' : 'activated'} successfully!`;
        this.isLoading = false;
        this.loadPromoCodes();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error toggling promo code status:', err);
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleServicePlanStatus(servicePlan: ServicePlan) {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.bookingService.toggleServicePlanStatus(servicePlan.id, !servicePlan.active).subscribe({
      next: () => {
        console.log(`Service plan ${servicePlan.name} status toggled to ${!servicePlan.active}`);
        this.successMessage = `Service plan ${servicePlan.active ? 'deactivated' : 'activated'} successfully!`;
        this.isLoading = false;
        this.loadServicePlans();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error toggling service plan status:', err);
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  toggleAddOnStatus(addOn: AddOn) {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.bookingService.toggleAddOnStatus(addOn.id, !addOn.active).subscribe({
      next: () => {
        console.log(`Add-on ${addOn.name} status toggled to ${!addOn.active}`);
        this.successMessage = `Add-on ${addOn.active ? 'deactivated' : 'activated'} successfully!`;
        this.isLoading = false;
        this.loadAddOns();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error toggling add-on status:', err);
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deletePromoCode(promoCode: PromoCode) {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.promoCodeService.deletePromoCode(promoCode.id).subscribe({
      next: () => {
        console.log(`Promo code ${promoCode.code} deleted successfully`);
        this.successMessage = `Promo code ${promoCode.code} deleted successfully!`;
        this.isLoading = false;
        this.loadPromoCodes();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error deleting promo code:', err);
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteServicePlan(servicePlan: ServicePlan) {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.bookingService.deleteServicePlan(servicePlan.id).subscribe({
      next: () => {
        console.log(`Service plan ${servicePlan.name} deleted successfully`);
        this.successMessage = `Service plan ${servicePlan.name} deleted successfully!`;
        this.isLoading = false;
        this.loadServicePlans();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error deleting service plan:', err);
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  deleteAddOn(addOn: AddOn) {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    this.bookingService.deleteAddOn(addOn.id).subscribe({
      next: () => {
        console.log(`Add-on ${addOn.name} deleted successfully`);
        this.successMessage = `Add-on ${addOn.name} deleted successfully!`;
        this.isLoading = false;
        this.loadAddOns();
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        console.error('Error deleting add-on:', err);
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openEditDialog(user: User, role: 'WASHER' | 'CUSTOMER') {
    this.errorMessage = null;
    this.successMessage = null;
    const dialogRef = this.dialog.open(EditWasherDialogComponent, {
      width: '500px',
      data: { ...user, role },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        console.log(`Updating ${role.toLowerCase()}:`, result);
        const updatedUser: Partial<User> = {
          ...user,
          fullName: result.fullName,
          email: result.email,
          phone: result.phone,
          serviceStatus: role === 'WASHER' ? result.serviceStatus : undefined,
        };
        this.userService.updateUser(user.id, updatedUser).subscribe({
          next: () => {
            console.log(`${role} updated successfully`);
            this.successMessage = `${role} updated successfully!`;
            this.cdr.detectChanges();
            if (role === 'WASHER') {
              this.snackBar.open('Washer details updated successfully!', 'Close', {
                duration: 3000,
                panelClass: 'snackbar-success',
                verticalPosition: 'top',
              });
            }
            this.isLoading = false;
            if (role === 'WASHER') {
              this.loadWashers();
            } else {
              this.loadCustomers();
            }
            this.cdr.detectChanges();
          },
          error: (err: Error) => {
            console.error(`Error updating ${role.toLowerCase()}:`, err);
            this.errorMessage = err.message;
            this.isLoading = false;
            this.cdr.detectChanges();
          },
        });
      }
    });
  }

  openEditPromoCodeDialog(promoCode?: PromoCode) {
    this.errorMessage = null;
    this.successMessage = null;
    const dialogRef = this.dialog.open(EditPromoCodeDialogComponent, {
      width: '500px',
      data: { promoCode },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        const promoData: Partial<PromoCode> = {
          code: result.code,
          discountType: result.discountType,
          discountValue: result.discountValue,
          expiryDate: result.expiryDate || undefined,
          maxUses: result.maxUses || undefined,
        };
        if (promoCode) {
          this.promoCodeService.updatePromoCode(promoCode.id, promoData).subscribe({
            next: () => {
              console.log('Promo code updated successfully');
              this.successMessage = 'Promo code updated successfully!';
              this.isLoading = false;
              this.loadPromoCodes();
              this.cdr.detectChanges();
            },
            error: (err: Error) => {
              console.error('Error updating promo code:', err);
              this.errorMessage = err.message;
              this.isLoading = false;
              this.cdr.detectChanges();
            },
          });
        } else {
          this.promoCodeService.createPromoCode(promoData).subscribe({
            next: () => {
              console.log('Promo code added successfully');
              this.successMessage = 'Promo code added successfully!';
              this.isLoading = false;
              this.loadPromoCodes();
              this.cdr.detectChanges();
            },
            error: (err: Error) => {
              console.error('Error adding promo code:', err);
              this.errorMessage = err.message;
              this.isLoading = false;
              this.cdr.detectChanges();
            },
          });
        }
      }
    });
  }

  openEditServicePlanDialog(servicePlan?: ServicePlan) {
    this.errorMessage = null;
    this.successMessage = null;
    const dialogRef = this.dialog.open(EditServicePlanDialogComponent, {
      width: '500px',
      data: { servicePlan },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        const servicePlanData: Partial<ServicePlan> = {
          name: result.name,
          price: result.price,
        };
        if (servicePlan) {
          this.bookingService.updateServicePlan(servicePlan.id, servicePlanData).subscribe({
            next: () => {
              console.log('Service plan updated successfully');
              this.successMessage = 'Service plan updated successfully!';
              this.isLoading = false;
              this.loadServicePlans();
              this.cdr.detectChanges();
            },
            error: (err: Error) => {
              console.error('Error updating service plan:', err);
              this.errorMessage = err.message;
              this.isLoading = false;
              this.cdr.detectChanges();
            },
          });
        } else {
          this.bookingService.createServicePlan(servicePlanData).subscribe({
            next: () => {
              console.log('Service plan added successfully');
              this.successMessage = 'Service plan added successfully!';
              this.isLoading = false;
              this.loadServicePlans();
              this.cdr.detectChanges();
            },
            error: (err: Error) => {
              console.error('Error adding service plan:', err);
              this.errorMessage = err.message;
              this.isLoading = false;
              this.cdr.detectChanges();
            },
          });
        }
      }
    });
  }

  openEditAddOnDialog(addOn?: AddOn) {
    this.errorMessage = null;
    this.successMessage = null;
    const dialogRef = this.dialog.open(EditAddOnDialogComponent, {
      width: '500px',
      data: { addOn },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.isLoading = true;
        const addOnData: Partial<AddOn> = {
          name: result.name,
          price: result.price,
        };
        if (addOn) {
          this.bookingService.updateAddOn(addOn.id, addOnData).subscribe({
            next: () => {
              console.log('Add-on updated successfully');
              this.successMessage = 'Add-on updated successfully!';
              this.isLoading = false;
              this.loadAddOns();
              this.cdr.detectChanges();
            },
            error: (err: Error) => {
              console.error('Error updating add-on:', err);
              this.errorMessage = err.message;
              this.isLoading = false;
              this.cdr.detectChanges();
            },
          });
        } else {
          this.bookingService.createAddOn(addOnData).subscribe({
            next: () => {
              console.log('Add-on added successfully');
              this.successMessage = 'Add-on added successfully!';
              this.isLoading = false;
              this.loadAddOns();
              this.cdr.detectChanges();
            },
            error: (err: Error) => {
              console.error('Error adding add-on:', err);
              this.errorMessage = err.message;
              this.isLoading = false;
              this.cdr.detectChanges();
            },
          });
        }
      }
    });
  }

  viewReviews(user: User, role: 'WASHER' | 'CUSTOMER') {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    console.log(`Fetching reviews for ${role.toLowerCase()}:`, user.id);
    const reviewObservable = role === 'WASHER'
      ? this.reviewService.getReviewsForWasher(user.id)
      : this.reviewService.getReviewsForCustomer(user.id);
    reviewObservable.subscribe({
      next: (reviews: Review[]) => {
        console.log('Reviews fetched:', reviews);
        this.isLoading = false;
        this.dialog.open(ViewReviewsDialogComponent, {
          width: '600px',
          data: { user, reviews, role },
        });
      },
      error: (err: Error) => {
        console.error(`Error loading reviews for ${role.toLowerCase()}:`, err);
        this.errorMessage = err.message;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  generateReport(washer: User) {
    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;
    console.log('Generating report for washer:', washer.id, washer.fullName);

    this.bookingService.getWasherBookingsForAdmin(washer.id).subscribe({
      next: (bookings: Booking[]) => {
        console.log('Bookings for report:', bookings);
        if (!bookings || bookings.length === 0) {
          this.reviewService.getReviewsForWasher(washer.id).subscribe({
            next: (reviews: Review[]) => {
              console.log('Reviews for washer:', reviews);
              if (reviews.length > 0) {
                this.errorMessage = `No bookings found for ${washer.fullName}, but ${reviews.length} reviews exist. Possible data inconsistency.`;
                this.isLoading = false;
                this.cdr.detectChanges();
                return;
              }
              this.errorMessage = `No bookings or reviews found for ${washer.fullName}.`;
              this.isLoading = false;
              this.cdr.detectChanges();
            },
            error: (err: Error) => {
              console.error('Error fetching reviews for fallback:', err);
              this.errorMessage = `No bookings found for ${washer.fullName}, and failed to check reviews: ${err.message}`;
              this.isLoading = false;
              this.cdr.detectChanges();
            },
          });
          return;
        }

        const doc = new Document({
          sections: [
            {
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: `Washer Report: ${washer.fullName || 'Unknown'}`,
                      bold: true,
                      size: 24,
                    }),
                  ],
                }),
                new Paragraph({
                  children: [new TextRun(`Email: ${washer.email}`)],
                }),
                new Paragraph({
                  children: [
                    new TextRun(`Service Status: ${washer.serviceStatus || 'OFFLINE'}`),
                  ],
                }),
                new Paragraph({
                  children: [new TextRun(`Active: ${washer.active ? 'Yes' : 'No'}`)],
                }),
                new Paragraph({ text: '' }),
                new Table({
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph('Booking ID')] }),
                        new TableCell({ children: [new Paragraph('Customer ID')] }),
                        new TableCell({ children: [new Paragraph('Customer Name')] }),
                        new TableCell({ children: [new Paragraph('Car ID')] }),
                        new TableCell({ children: [new Paragraph('Wash Package')] }),
                        new TableCell({ children: [new Paragraph('Status')] }),
                        new TableCell({ children: [new Paragraph('Total Amount')] }),
                        new TableCell({ children: [new Paragraph('Scheduled Time')] }),
                      ],
                    }),
                    ...bookings.map(booking => {
                      const customer = this.customers.data.find(c => c.id === booking.userId);
                      return new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph(booking.id)] }),
                          new TableCell({ children: [new Paragraph(booking.userId)] }),
                          new TableCell({ children: [new Paragraph(customer ? customer.fullName : 'Unknown')] }),
                          new TableCell({ children: [new Paragraph(booking.carId)] }),
                          new TableCell({ children: [new Paragraph(booking.washPackage)] }),
                          new TableCell({ children: [new Paragraph(booking.status)] }),
                          new TableCell({ children: [new Paragraph(booking.totalAmount?.toString() || 'N/A')] }),
                          new TableCell({ children: [new Paragraph(this.formatDate(booking.scheduledTime))] }),
                        ],
                      });
                    }),
                  ],
                }),
              ],
            },
          ],
        });

        Packer.toBlob(doc).then((blob) => {
          console.log('Saving report as Washer_Report_' + washer.id + '.docx');
          saveAs(blob, `Washer_Report_${washer.id}.docx`);
      this.successMessage = 'Report generated successfully!';
      this.lastAction = 'report';
          this.isLoading = false;
          this.cdr.detectChanges();
        }).catch((err) => {
          console.error('Error generating .docx:', err);
          this.errorMessage = 'Failed to generate report: Error creating document';
          this.isLoading = false;
          this.cdr.detectChanges();
        });
      },
      error: (err: Error) => {
        console.error('Error fetching bookings for report:', err);
        this.errorMessage = `Failed to fetch bookings for ${washer.fullName}: ${err.message}`;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
    this.errorMessage = null;
    this.successMessage = null;
    this.lastAction = null;
    this.showAddWasherForm = false;
    this.showAddPromoCodeForm = false;
    this.showAddServicePlanForm = false;
    this.showAddAddOnForm = false;
    this.addWasherForm.reset();
    this.assignOrderForm.reset();
    this.addServicePlanForm.reset();
    this.addAddOnForm.reset();
    this.reportForm.reset();
    this.loadFilteredBookings();
    this.cdr.detectChanges();
  }

  filterCustomers() {
    const term = this.customerSearchTerm.toLowerCase().trim();
    const res = this.customers.data.filter(customer =>
      customer.fullName.toLowerCase().includes(term) ||
      customer.email.toLowerCase().includes(term) ||
      (customer.phone || '').includes(term)
    );
    this.filteredCustomers.data = this.sortByNameArray(res as any[]);
    this.cdr.detectChanges();
  }

  filterWashers() {
    const term = this.washerSearchTerm.toLowerCase().trim();
    const res = this.washers.data.filter(washer =>
      washer.fullName.toLowerCase().includes(term) ||
      washer.email.toLowerCase().includes(term) ||
      (washer.phone || '').includes(term)
    );
    this.filteredWashers.data = this.sortByNameArray(res as any[]);
    this.cdr.detectChanges();
  }

  filterPromoCodes() {
    const term = this.promoCodeSearchTerm.toLowerCase().trim();
    const res = this.promoCodes.data.filter(promo =>
      promo.code.toLowerCase().includes(term) ||
      promo.discountType.toLowerCase().includes(term)
    );
    this.filteredPromoCodes.data = this.sortByNameArray(res as any[]);
    this.cdr.detectChanges();
  }

  filterServicePlans() {
    const term = this.servicePlanSearchTerm.toLowerCase().trim();
    const res = this.servicePlans.data.filter(plan =>
      plan.name.toLowerCase().includes(term)
    );
    this.filteredServicePlans.data = this.sortByNameArray(res as any[]);
    this.cdr.detectChanges();
  }

  filterAddOns() {
    const term = this.addOnSearchTerm.toLowerCase().trim();
    const res = this.addOns.data.filter(addOn =>
      addOn.name.toLowerCase().includes(term)
    );
    this.filteredAddOns.data = this.sortByNameArray(res as any[]);
    this.cdr.detectChanges();
  }

  // visible list based on search
  get visibleWashers() {
    const q = (this.washerDropdownSearch || '').toLowerCase().trim();
    if (!q) return this.washers.data;
    return this.washers.data.filter(w => (w.fullName || '').toLowerCase().includes(q) || (w.email || '').toLowerCase().includes(q));
  }

  toggleWasherDropdown() {
    // don't open if control is disabled
    const washerControl = this.assignOrderForm.get('washerId');
    if (washerControl && washerControl.disabled) {
      return;
    }
    this.washerDropdownOpen = !this.washerDropdownOpen;
    // clear search whenever opening
    if (this.washerDropdownOpen) this.washerDropdownSearch = '';
  }

  selectWasherFromDropdown(washer: any) {
    if (!washer || !washer.id || !washer.active) return;
    this.assignOrderForm.patchValue({ washerId: washer.id });
    this.washerDropdownOpen = false;
    // auto submit if booking is present
    const bookingId = this.assignOrderForm?.value?.bookingId;
    if (bookingId) {
      setTimeout(() => this.assignOrder(), 120);
    }
  }
}
