import React, { useState, useEffect } from 'react';
import {
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts';

const AmortizationSimulator = () => {
  // Default loan parameters
  const [loanAmount, setLoanAmount] = useState(250000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [startYear, setStartYear] = useState(2010);
  const [amortizationData, setAmortizationData] = useState([]);
  const [chartVisible, setChartVisible] = useState(true);
  const [scenarios, setScenarios] = useState([]);
  const [showScenarios, setShowScenarios] = useState(false);
  const [scenarioName, setScenarioName] = useState("");

  // Calculate amortization schedule
  const calculateAmortization = () => {
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = loanTermYears * 12;
    const monthlyPayment =
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1);

    let balance = loanAmount;
    const yearlyData = [];
    let crossoverMonth = null;
    let crossoverYear = null;
    let cumulativePrincipal = 0;
    let cumulativeInterest = 0;

    for (let year = 0; year < loanTermYears + 1; year++) {
      const currentYear = startYear + year;
      let yearlyPrincipal = 0;
      let yearlyInterest = 0;

      // Skip first year calculation for initial point
      if (year === 0) {
        yearlyData.push({
          year: currentYear,
          remainingBalance: balance,
          principal: 0,
          interest: 0,
          principalPercentage: 0,
          interestPercentage: 100,
          cumulativePrincipal: 0,
          cumulativeInterest: 0
        });
        continue;
      }

      for (let month = 1; month <= 12; month++) {
        const absoluteMonth = (year - 1) * 12 + month;

        if (absoluteMonth <= totalPayments) {
          const interestPayment = balance * monthlyRate;
          const principalPayment = monthlyPayment - interestPayment;

          yearlyPrincipal += principalPayment;
          yearlyInterest += interestPayment;

          cumulativePrincipal += principalPayment;
          cumulativeInterest += interestPayment;

          // Check for monthly crossover point (when principal exceeds interest in a single payment)
          if (crossoverMonth === null && principalPayment > interestPayment) {
            crossoverMonth = absoluteMonth;
            crossoverYear = currentYear + month / 12;
          }

          balance -= principalPayment;
          if (balance < 0) balance = 0;
        }
      }

      const totalYearlyPayment = yearlyPrincipal + yearlyInterest;
      const principalPercentage =
        totalYearlyPayment > 0
          ? (yearlyPrincipal / totalYearlyPayment) * 100
          : 0;
      const interestPercentage =
        totalYearlyPayment > 0
          ? (yearlyInterest / totalYearlyPayment) * 100
          : 0;

      yearlyData.push({
        year: currentYear,
        remainingBalance: balance,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        principalPercentage,
        interestPercentage,
        cumulativePrincipal,
        cumulativeInterest
      });
    }

    // Add crossover information
    const crossoverInfo = {
      monthNumber: crossoverMonth,
      year: crossoverYear,
      yearFraction: crossoverMonth ? (crossoverMonth / 12).toFixed(1) : "N/A",
      percentageOfTerm: crossoverMonth
        ? ((crossoverMonth / totalPayments) * 100).toFixed(2)
        : "N/A"
    };

    // Find equity crossover (50% equity point)
    let equityCrossoverYear = null;
    for (let i = 0; i < yearlyData.length; i++) {
      if (yearlyData[i].remainingBalance <= loanAmount / 2) {
        equityCrossoverYear = yearlyData[i].year;
        break;
      }
    }

    setAmortizationData(yearlyData);
    return { crossoverInfo, equityCrossoverYear };
  };

  // Store crossover information
  const [crossoverInfo, setCrossoverInfo] = useState(null);
  const [equityCrossoverYear, setEquityCrossoverYear] = useState(null);

  // Calculate on initial render and when parameters change
  useEffect(() => {
    const { crossoverInfo, equityCrossoverYear } = calculateAmortization();
    setCrossoverInfo(crossoverInfo);
    setEquityCrossoverYear(equityCrossoverYear);
  }, [loanAmount, interestRate, loanTermYears, startYear]);

  // Format as currency
  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);

  // Format as percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(2)}%`;
  };

  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = loanTermYears * 12;
    return (
      loanAmount *
      (monthlyRate * Math.pow(1 + monthlyRate, totalPayments)) /
      (Math.pow(1 + monthlyRate, totalPayments) - 1)
    );
  };

  const monthlyPayment = calculateMonthlyPayment();
  const totalInterest = monthlyPayment * loanTermYears * 12 - loanAmount;
  const totalCost = monthlyPayment * loanTermYears * 12;

  return (
    <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "24px" }}>
        Loan Amortization Schedule Simulator
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "24px",
          marginBottom: "32px"
        }}
      >
        <div>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "4px"
              }}
            >
              Loan Amount ($)
            </label>
            <input
              type="number"
              value={loanAmount}
              onChange={(e) =>
                setLoanAmount(Math.max(1000, Number(e.target.value)))
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "4px"
              }}
            >
              Interest Rate (%)
            </label>
            <input
              type="number"
              value={interestRate}
              onChange={(e) =>
                setInterestRate(
                  Math.max(0.1, Math.min(20, Number(e.target.value)))
                )
              }
              step="0.1"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px"
              }}
            />
          </div>
        </div>

        <div>
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "4px"
              }}
            >
              Loan Term (Years)
            </label>
            <input
              type="number"
              value={loanTermYears}
              onChange={(e) =>
                setLoanTermYears(Math.max(1, Math.min(50, Number(e.target.value))))
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px"
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "4px"
              }}
            >
              Start Year
            </label>
            <input
              type="number"
              value={startYear}
              onChange={(e) =>
                setStartYear(Math.max(1900, Number(e.target.value)))
              }
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #d1d5db",
                borderRadius: "4px"
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          background: "#f9fafb",
          padding: "16px",
          borderRadius: "4px",
          marginBottom: "24px"
        }}
      >
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: "600",
            marginBottom: "8px"
          }}
        >
          Loan Summary
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "16px"
          }}
        >
          <div>
            <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
              Monthly Payment:
            </span>
            <p style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
              {formatCurrency(monthlyPayment)}
            </p>
          </div>
          <div>
            <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
              Total Interest:
            </span>
            <p style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
              {formatCurrency(totalInterest)}
            </p>
          </div>
          <div>
            <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
              Total Cost:
            </span>
            <p style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
              {formatCurrency(totalCost)}
            </p>
          </div>
          <div>
            <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
              Interest to Principal Ratio:
            </span>
            <p style={{ fontWeight: "bold", fontSize: "1.25rem" }}>
              {((totalInterest / loanAmount) * 100).toFixed(2)}%
            </p>
          </div>
          <div>
            <span style={{ fontSize: "0.875rem", color: "#4b5563" }}>
              Interest Efficiency:
            </span>
            <p
              style={{
                fontWeight: "bold",
                fontSize: "1.25rem",
                color: totalInterest > loanAmount ? "#ef4444" : "#22c55e"
              }}
            >
              {(loanAmount / totalInterest).toFixed(2)}x
            </p>
          </div>
        </div>
      </div>

      <div
        style={{ marginBottom: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}
      >
        <button
          onClick={() => setChartVisible(!chartVisible)}
          style={{
            padding: "8px 16px",
            background: "#e5e7eb",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          {chartVisible ? "Hide Chart" : "Show Chart"}
        </button>

        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            value={scenarioName}
            onChange={(e) => setScenarioName(e.target.value)}
            placeholder="Scenario name"
            style={{
              padding: "8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px"
            }}
          />
          <button
            onClick={() => {
              if (scenarioName.trim()) {
                const monthly = calculateMonthlyPayment();
                const totalInt = monthly * loanTermYears * 12 - loanAmount;
                const newScenario = {
                  id: Date.now(),
                  name: scenarioName,
                  loanAmount,
                  interestRate,
                  loanTermYears,
                  monthlyPayment: monthly,
                  totalInterest: totalInt,
                  interestRatio: (totalInt / loanAmount) * 100
                };
                setScenarios([...scenarios, newScenario]);
                setScenarioName("");
              }
            }}
            style={{
              padding: "8px 16px",
              background: "#4f46e5",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            Save Scenario
          </button>
          <button
            onClick={() => setShowScenarios(!showScenarios)}
            style={{
              padding: "8px 16px",
              background: "#e5e7eb",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer"
            }}
          >
            {showScenarios ? "Hide Comparisons" : "Show Comparisons"}
          </button>
        </div>
      </div>

      {showScenarios && scenarios.length > 0 && (
        <div
          style={{
            marginBottom: "24px",
            background: "#f9fafb",
            padding: "16px",
            borderRadius: "4px"
          }}
        >
          <h3
            style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "12px" }}
          >
            Scenario Comparison
          </h3>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#e5e7eb" }}>
                  <th
                    style={{ padding: "8px", textAlign: "left", border: "1px solid #d1d5db" }}
                  >
                    Scenario
                  </th>
                  <th
                    style={{ padding: "8px", textAlign: "left", border: "1px solid #d1d5db" }}
                  >
                    Loan Amount
                  </th>
                  <th
                    style={{ padding: "8px", textAlign: "left", border: "1px solid #d1d5db" }}
                  >
                    Interest Rate
                  </th>
                  <th
                    style={{ padding: "8px", textAlign: "left", border: "1px solid #d1d5db" }}
                  >
                    Term (years)
                  </th>
                  <th
                    style={{ padding: "8px", textAlign: "left", border: "1px solid #d1d5db" }}
                  >
                    Monthly Payment
                  </th>
                  <th
                    style={{ padding: "8px", textAlign: "left", border: "1px solid #d1d5db" }}
                  >
                    Total Interest
                  </th>
                  <th
                    style={{ padding: "8px", textAlign: "left", border: "1px solid #d1d5db" }}
                  >
                    Interest Ratio
                  </th>
                  <th
                    style={{ padding: "8px", textAlign: "left", border: "1px solid #d1d5db" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => (
                  <tr key={scenario.id} style={{ borderBottom: "1px solid #d1d5db" }}>
                    <td
                      style={{ padding: "8px", border: "1px solid #d1d5db" }}
                    >
                      {scenario.name}
                    </td>
                    <td
                      style={{ padding: "8px", border: "1px solid #d1d5db" }}
                    >
                      {formatCurrency(scenario.loanAmount)}
                    </td>
                    <td
                      style={{ padding: "8px", border: "1px solid #d1d5db" }}
                    >
                      {scenario.interestRate}%
                    </td>
                    <td
                      style={{ padding: "8px", border: "1px solid #d1d5db" }}
                    >
                      {scenario.loanTermYears}
                    </td>
                    <td
                      style={{ padding: "8px", border: "1px solid #d1d5db" }}
                    >
                      {formatCurrency(scenario.monthlyPayment)}
                    </td>
                    <td
                      style={{ padding: "8px", border: "1px solid #d1d5db" }}
                    >
                      {formatCurrency(scenario.totalInterest)}
                    </td>
                    <td
                      style={{ padding: "8px", border: "1px solid #d1d5db" }}
                    >
                      {scenario.interestRatio.toFixed(2)}%
                    </td>
                    <td
                      style={{ padding: "8px", border: "1px solid #d1d5db" }}
                    >
                      <button
                        onClick={() => {
                          setLoanAmount(scenario.loanAmount);
                          setInterestRate(scenario.interestRate);
                          setLoanTermYears(scenario.loanTermYears);
                        }}
                        style={{
                          padding: "4px 8px",
                          background: "#4f46e5",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer",
                          marginRight: "4px"
                        }}
                      >
                        Load
                      </button>
                      <button
                        onClick={() => {
                          setScenarios(scenarios.filter((s) => s.id !== scenario.id));
                        }}
                        style={{
                          padding: "4px 8px",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {chartVisible && (
        <div>
          <div style={{ height: "400px", width: "100%", marginBottom: "32px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={amortizationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  label={{
                    value: "Payment Amount ($)",
                    angle: -90,
                    position: "insideLeft"
                  }}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  label={{
                    value: "Remaining Balance ($)",
                    angle: 90,
                    position: "insideRight"
                  }}
                />
                <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="principal"
                  name="Principal"
                  stackId="a"
                  fill="#82ca9d"
                />
                <Bar
                  yAxisId="left"
                  dataKey="interest"
                  name="Interest"
                  stackId="a"
                  fill="#8884d8"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="remainingBalance"
                  name="Remaining Balance"
                  stroke="#ff7e6b"
                  strokeWidth={3}
                  dot={{ fill: "white", stroke: "#ff7e6b", strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginBottom: "32px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "16px"
              }}
            >
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600" }}>
                Interest vs Principal Ratio
              </h3>

              <div
                style={{
                  background: "#f0f9ff",
                  padding: "12px",
                  borderRadius: "4px",
                  border: "1px solid #bae6fd"
                }}
              >
                <h4
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#0369a1"
                  }}
                >
                  Key Insights:
                </h4>
                <ul style={{ fontSize: "0.875rem", margin: 0, paddingLeft: "20px" }}>
                  <li style={{ marginBottom: "4px" }}>
                    Principal exceeds interest at: Year{" "}
                    {crossoverInfo?.yearFraction || "N/A"}
                    {crossoverInfo?.monthNumber &&
                      ` (${crossoverInfo.percentageOfTerm}% of loan term)`}
                  </li>
                  <li style={{ marginBottom: "4px" }}>
                    50% equity reached:{" "}
                    {equityCrossoverYear
                      ? `Year ${equityCrossoverYear}`
                      : "Not within loan term"}
                  </li>
                  <li>
                    Interest-to-principal ratio:{" "}
                    {((totalInterest / loanAmount) * 100).toFixed(2)}%
                  </li>
                </ul>
              </div>
            </div>

            <div style={{ height: "300px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={amortizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis
                    domain={[0, 100]}
                    label={{ value: "Percentage (%)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip formatter={(value, name) => [`${value.toFixed(2)}%`, name]} />
                  <Legend />
                  <Bar
                    dataKey="principalPercentage"
                    name="Principal %"
                    fill="#82ca9d"
                    stackId="a"
                  />
                  <Bar
                    dataKey="interestPercentage"
                    name="Interest %"
                    fill="#8884d8"
                    stackId="a"
                  />
                  {crossoverInfo?.year && (
                    <ReferenceLine
                      x={Math.floor(crossoverInfo.year)}
                      stroke="#ef4444"
                      strokeDasharray="5 5"
                      label={{
                        value: "Principal > Interest",
                        position: "top",
                        fill: "#ef4444"
                      }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div style={{ height: "300px", width: "100%", marginTop: "24px" }}>
              <h3 style={{ fontSize: "1.125rem", fontWeight: "600", marginBottom: "8px" }}>
                Cumulative Principal vs Interest
              </h3>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={amortizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis
                    label={{ value: "Amount ($)", angle: -90, position: "insideLeft" }}
                  />
                  <Tooltip formatter={(value, name) => [formatCurrency(value), name]} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="cumulativePrincipal"
                    name="Cumulative Principal"
                    stroke="#82ca9d"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="cumulativeInterest"
                    name="Cumulative Interest"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                  />
                  {equityCrossoverYear && (
                    <ReferenceLine
                      x={equityCrossoverYear}
                      stroke="#22c55e"
                      strokeDasharray="5 5"
                      label={{ value: "50% Equity", position: "top", fill: "#22c55e" }}
                    />
                  )}
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto", marginTop: "32px" }}>
        <table
          style={{
            minWidth: "100%",
            background: "white",
            borderCollapse: "collapse"
          }}
        >
          <thead>
            <tr style={{ background: "#f3f4f6" }}>
              <th
                style={{ padding: "8px 16px", border: "1px solid #e5e7eb", textAlign: "left" }}
              >
                Year
              </th>
              <th
                style={{ padding: "8px 16px", border: "1px solid #e5e7eb", textAlign: "left" }}
              >
                Principal Paid
              </th>
              <th
                style={{ padding: "8px 16px", border: "1px solid #e5e7eb", textAlign: "left" }}
              >
                Interest Paid
              </th>
              <th
                style={{ padding: "8px 16px", border: "1px solid #e5e7eb", textAlign: "left" }}
              >
                Principal %
              </th>
              <th
                style={{ padding: "8px 16px", border: "1px solid #e5e7eb", textAlign: "left" }}
              >
                Interest %
              </th>
              <th
                style={{ padding: "8px 16px", border: "1px solid #e5e7eb", textAlign: "left" }}
              >
                Remaining Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {amortizationData.map((data, index) => (
              <tr
                key={index}
                style={{ background: index % 2 === 0 ? "#f9fafb" : "white" }}
              >
                <td style={{ padding: "8px 16px", border: "1px solid #e5e7eb" }}>
                  {data.year}
                </td>
                <td style={{ padding: "8px 16px", border: "1px solid #e5e7eb" }}>
                  {formatCurrency(data.principal)}
                </td>
                <td style={{ padding: "8px 16px", border: "1px solid #e5e7eb" }}>
                  {formatCurrency(data.interest)}
                </td>
                <td style={{ padding: "8px 16px", border: "1px solid #e5e7eb" }}>
                  {formatPercentage(data.principalPercentage)}
                </td>
                <td style={{ padding: "8px 16px", border: "1px solid #e5e7eb" }}>
                  {formatPercentage(data.interestPercentage)}
                </td>
                <td style={{ padding: "8px 16px", border: "1px solid #e5e7eb" }}>
                  {formatCurrency(data.remainingBalance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AmortizationSimulator;
