import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface IncomeSource {
  title: string;
  amount: number;
  description: string;
  icon: string;
}

interface Transaction {
  date: string;
  source: string;
  amount: number;
  status: string;
}

@Component({
  selector: 'app-income-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income-content.component.html',
  styleUrls: ['./income-content.component.scss']
})
export class IncomeContentComponent {
  incomeSources: IncomeSource[] = [
    {
      title: 'Salary',
      amount: 5500,
      description: 'Monthly salary from full-time employment',
      icon: '💼'
    },
    {
      title: 'Freelance',
      amount: 1200,
      description: 'Income from freelance projects',
      icon: '💻'
    },
    {
      title: 'Investments',
      amount: 850,
      description: 'Returns from stock and bond investments',
      icon: '📈'
    },
    {
      title: 'Rental Income',
      amount: 1800,
      description: 'Monthly rental from property',
      icon: '🏠'
    },
    {
      title: 'Consulting',
      amount: 3200,
      description: 'Business consulting services',
      icon: '📊'
    },
    {
      title: 'Online Courses',
      amount: 950,
      description: 'Revenue from online teaching',
      icon: '🎓'
    },
    {
      title: 'Dividends',
      amount: 420,
      description: 'Quarterly dividend payments',
      icon: '💰'
    },
    {
      title: 'Side Business',
      amount: 1650,
      description: 'E-commerce store revenue',
      icon: '🛒'
    },
    {
      title: 'Royalties',
      amount: 780,
      description: 'Book and content royalties',
      icon: '📚'
    },
    {
      title: 'Affiliate Marketing',
      amount: 540,
      description: 'Commission from referrals',
      icon: '🔗'
    },
    {
      title: 'Photography',
      amount: 890,
      description: 'Stock photo sales',
      icon: '📷'
    },
    {
      title: 'Crypto Staking',
      amount: 320,
      description: 'Cryptocurrency staking rewards',
      icon: '🪙'
    }
  ];

  transactions: Transaction[] = [
    { date: '2024-02-01', source: 'Salary', amount: 5500, status: 'Received' },
    { date: '2024-02-02', source: 'Freelance', amount: 600, status: 'Received' },
    { date: '2024-02-03', source: 'Investments', amount: 850, status: 'Received' },
    { date: '2024-02-04', source: 'Rental Income', amount: 1800, status: 'Received' },
    { date: '2024-02-05', source: 'Consulting', amount: 3200, status: 'Received' },
    { date: '2024-02-06', source: 'Online Courses', amount: 950, status: 'Pending' },
    { date: '2024-02-07', source: 'Dividends', amount: 420, status: 'Received' },
    { date: '2024-02-08', source: 'Side Business', amount: 1650, status: 'Received' },
    { date: '2024-02-09', source: 'Royalties', amount: 780, status: 'Received' },
    { date: '2024-02-10', source: 'Affiliate Marketing', amount: 540, status: 'Pending' },
    { date: '2024-02-11', source: 'Photography', amount: 890, status: 'Received' },
    { date: '2024-02-12', source: 'Crypto Staking', amount: 320, status: 'Received' },
    { date: '2024-02-13', source: 'Freelance', amount: 750, status: 'Received' },
    { date: '2024-02-14', source: 'Consulting', amount: 2800, status: 'Pending' },
    { date: '2024-02-15', source: 'Salary', amount: 5500, status: 'Received' },
    { date: '2024-02-16', source: 'Investments', amount: 920, status: 'Received' },
    { date: '2024-02-17', source: 'Online Courses', amount: 1100, status: 'Received' },
    { date: '2024-02-18', source: 'Side Business', amount: 1450, status: 'Received' },
    { date: '2024-02-19', source: 'Royalties', amount: 680, status: 'Pending' },
    { date: '2024-02-20', source: 'Photography', amount: 940, status: 'Received' },
    { date: '2024-02-21', source: 'Rental Income', amount: 1800, status: 'Received' },
    { date: '2024-02-22', source: 'Affiliate Marketing', amount: 620, status: 'Received' },
    { date: '2024-02-23', source: 'Freelance', amount: 850, status: 'Received' },
    { date: '2024-02-24', source: 'Crypto Staking', amount: 380, status: 'Pending' },
    { date: '2024-02-25', source: 'Consulting', amount: 3500, status: 'Received' },
    { date: '2024-02-26', source: 'Dividends', amount: 450, status: 'Received' },
    { date: '2024-02-27', source: 'Online Courses', amount: 880, status: 'Received' },
    { date: '2024-02-28', source: 'Side Business', amount: 1720, status: 'Received' },
    { date: '2024-03-01', source: 'Salary', amount: 5500, status: 'Received' },
    { date: '2024-03-02', source: 'Photography', amount: 760, status: 'Pending' },
    { date: '2024-03-03', source: 'Royalties', amount: 820, status: 'Received' },
    { date: '2024-03-04', source: 'Investments', amount: 910, status: 'Received' },
    { date: '2024-03-05', source: 'Freelance', amount: 1200, status: 'Received' },
    { date: '2024-03-06', source: 'Affiliate Marketing', amount: 580, status: 'Received' },
    { date: '2024-03-07', source: 'Consulting', amount: 2900, status: 'Pending' },
    { date: '2024-03-08', source: 'Rental Income', amount: 1800, status: 'Received' },
    { date: '2024-03-09', source: 'Online Courses', amount: 1050, status: 'Received' },
    { date: '2024-03-10', source: 'Crypto Staking', amount: 340, status: 'Received' },
    { date: '2024-03-11', source: 'Side Business', amount: 1580, status: 'Received' },
    { date: '2024-03-12', source: 'Photography', amount: 890, status: 'Pending' }
  ];

  getTotalIncome(): number {
    return this.incomeSources.reduce((sum, source) => sum + source.amount, 0);
  }
}
