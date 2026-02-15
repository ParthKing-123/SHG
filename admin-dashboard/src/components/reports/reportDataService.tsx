import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";

import { useAuth } from "../../../../member-dashboard/src/components/AuthContext";

/**
 * Fetches data for reports based on report type and date range
 */

export async function fetchReportData(
    shgID : string,
  reportType: string,
  from: Date,
  to: Date
) {
    
  const fromTs = Timestamp.fromDate(from);
  const toTs = Timestamp.fromDate(to);

  switch (reportType) {

case "members": {
  const snap = await getDocs(
    collection(db, "ShgGroups", shgID, "members")
  );

  const members = snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));

  return {
    members,
  };
}

case "loans": {
  const snap = await getDocs(
    collection(db, "ShgGroups", shgID, "loans")
  );

  const loans = snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));

  return {
    loans,
  };
}


case "analytics": {
  const snap = await getDocs(
    collection(db, "ShgGroups", shgID, "trustScores")
  );

  const trustScores = snap.docs.map(d => ({
    id: d.id,
    ...d.data(),
  }));

  return {
    trustScores,
  };
}



    case "financial": {
    //   const txSnap = await getDocs(
    //     query(
    //       collection(db, "transactions"),
    //       where("date", ">=", fromTs),
    //       where("date", "<=", toTs)
    //     )
    //   );

      const loanSnap = await getDocs(collection(db,"ShgGroups",shgID, "loans"));

      const rawLoans = loanSnap.docs.map(d => ({
  id: d.id,
  ...d.data(),
}));

const normalizedLoans = rawLoans.map((loan: any) => {
  const dueDates = loan.dueDates || [];

  const totalEmis = dueDates.length;
  const paidEmis = dueDates.filter((e: any) => e.paid).length;

        const overdueEmis = dueDates.filter((e: any) => {
            if (e.paid) return false;
            if (!e.date?.toDate) return false;
            return e.date.toDate() < new Date();
        }).length;

        return {
            loanId: loan.id,
            memberId: loan.memberId,

            principal: loan.principalAmount,
            interestRate: loan.interestRate,
            tenureMonths: loan.tenureMonths,
            emiAmount: loan.emiAmount,

            totalPayable: loan.totalPayable,
            paidAmount: loan.paidAmount,
            remainingAmount: loan.remainingAmount,

            totalEmis,
            paidEmis,
            overdueEmis,

            status: loan.status,
            purpose: loan.purpose,
            disbursedAt: loan.disbursedAt?.toDate?.() ?? null,
        };
        });

        return {
        loans: normalizedLoans,
        };
    }

    // case "members": {
    //   const snap = await getDocs(collection(db, "members"));
    //   return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // }

    // case "loans": {
    //   const snap = await getDocs(collection(db, "loans"));
    //   return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // }

    // case "analytics": {
    //   const snap = await getDocs(collection(db, "trustScores"));
    //   return snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // }

    // default:
    //   return [];
  }
}
