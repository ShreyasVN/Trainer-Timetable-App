import React, { useState, useEffect } from 'react';
import { userService, sessionService } from './api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Papa from 'papaparse';

function TrainerUtilization() {
  const [loading, setLoading] = useState(true);
  const [utilizationData, setUtilizationData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [currentMonth, currentYear]);

  const fetchData = async () => {
    try {
      const [trainersRes, sessionsRes] = await Promise.all([
        userService.getAllUsers(),
        sessionService.getAllSessions()
      ]);

      const trainerUsers = trainersRes.data.filter(t => t.role === 'trainer');
      calculateUtilization(trainerUsers, sessionsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load utilization data');
    } finally {
      setLoading(false);
    }
  };

  const calculateUtilization = (trainerUsers, allSessions) => {
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    
    const utilization = trainerUsers.map(trainer => {
      // Filter sessions for this trainer in the current month
      const trainerSessions = allSessions.filter(session => 
        session.trainer_id === trainer.id &&
        new Date(session.date) >= monthStart &&
        new Date(session.date) <= monthEnd
      );

      // Calculate statistics
      const totalSessions = trainerSessions.length;
      const attendedSessions = trainerSessions.filter(s => s.attended).length;
      const totalHours = trainerSessions.reduce((sum, session) => {
        const duration = session.duration || 60; // Default 60 minutes
        return sum + (duration / 60); // Convert to hours
      }, 0);
      
      const attendanceRate = totalSessions > 0 ? (attendedSessions / totalSessions * 100).toFixed(1) : 0;
      const averageHoursPerSession = totalSessions > 0 ? (totalHours / totalSessions).toFixed(1) : 0;
      
      // Calculate utilization percentage (assuming 8-hour workday, 22 working days per month)
      const maxPossibleHours = 8 * 22; // 176 hours per month
      const utilizationPercentage = maxPossibleHours > 0 ? (totalHours / maxPossibleHours * 100).toFixed(1) : 0;

      return {
        id: trainer.id,
        name: trainer.email,
        totalSessions,
        attendedSessions,
        missedSessions: totalSessions - attendedSessions,
        totalHours: totalHours.toFixed(1),
        averageHoursPerSession,
        attendanceRate: `${attendanceRate}%`,
        utilizationPercentage: `${utilizationPercentage}%`,
        status: getUtilizationStatus(utilizationPercentage)
      };
    });

    setUtilizationData(utilization);
  };

  const getUtilizationStatus = (utilization) => {
    const util = parseFloat(utilization);
    if (util >= 80) return 'High';
    if (util >= 60) return 'Medium';
    if (util >= 40) return 'Low';
    return 'Very Low';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'High': return 'text-green-600 bg-green-100';
      case 'Medium': return 'text-yellow-600 bg-yellow-100';
      case 'Low': return 'text-orange-600 bg-orange-100';
      case 'Very Low': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const exportUtilizationCSV = () => {
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
    const csv = Papa.unparse(utilizationData.map(data => ({
      'Trainer Name': data.name,
      'Total Sessions': data.totalSessions,
      'Attended Sessions': data.attendedSessions,
      'Missed Sessions': data.missedSessions,
      'Total Hours': data.totalHours,
      'Average Hours/Session': data.averageHoursPerSession,
      'Attendance Rate': data.attendanceRate,
      'Utilization Rate': data.utilizationPercentage,
      'Status': data.status
    })));
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Trainer_Utilization_${monthName}_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportUtilizationPDF = () => {
    const monthName = new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' });
    const doc = new jsPDF();
    
    doc.text(`Trainer Utilization Report - ${monthName} ${currentYear}`, 14, 16);
    
    doc.autoTable({
      startY: 25,
      head: [['Trainer', 'Sessions', 'Hours', 'Attendance', 'Utilization', 'Status']],
      body: utilizationData.map(data => [
        data.name,
        `${data.attendedSessions}/${data.totalSessions}`,
        data.totalHours,
        data.attendanceRate,
        data.utilizationPercentage,
        data.status
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save(`Trainer_Utilization_${monthName}_${currentYear}.pdf`);
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) return <div className="text-center p-4">Loading utilization data...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <ToastContainer />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-semibold">Trainer Utilization Report</h3>
          <p className="text-sm text-gray-600">
            {months[currentMonth]} {currentYear}
          </p>
        </div>
        
        <div className="flex gap-2">
          <select
            value={currentMonth}
            onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
            className="border rounded px-3 py-1"
          >
            {months.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          
          <select
            value={currentYear}
            onChange={(e) => setCurrentYear(parseInt(e.target.value))}
            className="border rounded px-3 py-1"
          >
            {[2023, 2024, 2025, 2026].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="mb-4">
        <button 
          onClick={exportUtilizationCSV}
          className="bg-green-600 text-white px-4 py-2 rounded mr-2"
        >
          Export CSV
        </button>
        <button 
          onClick={exportUtilizationPDF}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Export PDF
        </button>
      </div>

      {/* Utilization Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trainer Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Sessions
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attended
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Missed
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Hours
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Hours/Session
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attendance Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilization Rate
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {utilizationData.map((trainer) => (
              <tr key={trainer.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {trainer.name}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trainer.totalSessions}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                  {trainer.attendedSessions}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                  {trainer.missedSessions}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trainer.totalHours}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trainer.averageHoursPerSession}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trainer.attendanceRate}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {trainer.utilizationPercentage}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(trainer.status)}`}>
                    {trainer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Statistics */}
      {utilizationData.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800">Total Trainers</h4>
            <p className="text-2xl font-bold text-blue-900">{utilizationData.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-green-800">Average Attendance</h4>
            <p className="text-2xl font-bold text-green-900">
              {(utilizationData.reduce((sum, t) => sum + parseFloat(t.attendanceRate), 0) / utilizationData.length).toFixed(1)}%
            </p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800">Average Utilization</h4>
            <p className="text-2xl font-bold text-yellow-900">
              {(utilizationData.reduce((sum, t) => sum + parseFloat(t.utilizationPercentage), 0) / utilizationData.length).toFixed(1)}%
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-purple-800">Total Sessions</h4>
            <p className="text-2xl font-bold text-purple-900">
              {utilizationData.reduce((sum, t) => sum + t.totalSessions, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrainerUtilization; 