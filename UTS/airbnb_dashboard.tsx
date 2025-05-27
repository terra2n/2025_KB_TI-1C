import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ScatterPlot, Scatter, LineChart, Line, HistogramChart, Histogram } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AirbnbDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const loadData = async () => {
      try {
        // Read CSV file
        const csvContent = await window.fs.readFile('airbnb.csv', { encoding: 'utf8' });
        
        // Parse CSV
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        const parsedData = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const obj = {};
          headers.forEach((header, index) => {
            let value = values[index];
            // Convert numeric fields
            if (['id', 'host_id', 'price', 'minimum_nights', 'number_of_reviews', 'calculated_host_listings_count', 'availability_365'].includes(header)) {
              value = value ? parseFloat(value) : 0;
            }
            if (['latitude', 'longitude', 'reviews_per_month'].includes(header)) {
              value = value ? parseFloat(value) : null;
            }
            obj[header] = value;
          });
          return obj;
        });

        setData(parsedData);
        
        // Calculate summary statistics
        const totalListings = parsedData.length;
        const avgPrice = parsedData.reduce((sum, item) => sum + (item.price || 0), 0) / totalListings;
        const avgReviews = parsedData.reduce((sum, item) => sum + (item.number_of_reviews || 0), 0) / totalListings;
        const avgAvailability = parsedData.reduce((sum, item) => sum + (item.availability_365 || 0), 0) / totalListings;
        
        setSummary({
          totalListings,
          avgPrice: avgPrice.toFixed(2),
          avgReviews: avgReviews.toFixed(2),
          avgAvailability: avgAvailability.toFixed(0)
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading Airbnb Data...</div>
      </div>
    );
  }

  // Prepare data for visualizations
  const boroughData = data.reduce((acc, item) => {
    const borough = item.neighbourhood_group;
    if (!acc[borough]) {
      acc[borough] = { name: borough, count: 0, avgPrice: 0, totalPrice: 0 };
    }
    acc[borough].count++;
    acc[borough].totalPrice += item.price || 0;
    acc[borough].avgPrice = acc[borough].totalPrice / acc[borough].count;
    return acc;
  }, {});
  
  const boroughChartData = Object.values(boroughData).map(item => ({
    name: item.name,
    listings: item.count,
    avgPrice: Math.round(item.avgPrice)
  }));

  const roomTypeData = data.reduce((acc, item) => {
    const roomType = item.room_type;
    if (!acc[roomType]) {
      acc[roomType] = { name: roomType, count: 0, avgPrice: 0, totalPrice: 0 };
    }
    acc[roomType].count++;
    acc[roomType].totalPrice += item.price || 0;
    acc[roomType].avgPrice = acc[roomType].totalPrice / acc[roomType].count;
    return acc;
  }, {});

  const roomTypeChartData = Object.values(roomTypeData);

  // Price distribution data
  const priceRanges = [
    { range: '$0-50', min: 0, max: 50 },
    { range: '$51-100', min: 51, max: 100 },
    { range: '$101-200', min: 101, max: 200 },
    { range: '$201-500', min: 201, max: 500 },
    { range: '$500+', min: 501, max: Infinity }
  ];

  const priceDistribution = priceRanges.map(range => ({
    range: range.range,
    count: data.filter(item => item.price >= range.min && item.price <= range.max).length
  }));

  // Review analysis
  const reviewRanges = [
    { range: '0 Reviews', min: 0, max: 0 },
    { range: '1-10 Reviews', min: 1, max: 10 },
    { range: '11-50 Reviews', min: 11, max: 50 },
    { range: '51-100 Reviews', min: 51, max: 100 },
    { range: '100+ Reviews', min: 101, max: Infinity }
  ];

  const reviewDistribution = reviewRanges.map(range => ({
    range: range.range,
    count: data.filter(item => item.number_of_reviews >= range.min && item.number_of_reviews <= range.max).length
  }));

  // Availability analysis
  const availabilityRanges = [
    { range: '0-30 days', min: 0, max: 30 },
    { range: '31-90 days', min: 31, max: 90 },
    { range: '91-180 days', min: 91, max: 180 },
    { range: '181-365 days', min: 181, max: 365 }
  ];

  const availabilityDistribution = availabilityRanges.map(range => ({
    range: range.range,
    count: data.filter(item => item.availability_365 >= range.min && item.availability_365 <= range.max).length
  }));

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Airbnb NYC 2019 Data Analysis</h1>
          <p className="text-lg text-gray-600">Comprehensive Analysis of {summary.totalListings?.toLocaleString()} Listings</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{summary.totalListings?.toLocaleString()}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Price</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${summary.avgPrice}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Average Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{summary.avgReviews}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Avg Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{summary.avgAvailability} days</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Borough Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Listings by Borough</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={boroughChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="listings" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Average Price by Borough */}
          <Card>
            <CardHeader>
              <CardTitle>Average Price by Borough</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={boroughChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value}`, 'Average Price']} />
                  <Bar dataKey="avgPrice" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Room Type Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Room Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={roomTypeChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    label={({name, percent}) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  >
                    {roomTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Price Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Price Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Review Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Review Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reviewDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#ff7c7c" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Availability Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Availability Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={availabilityDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8dd1e1" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Key Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Key Insights dari Analisis Data</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Distribusi Geografis</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Manhattan dan Brooklyn mendominasi dengan jumlah listing terbanyak</li>
                  <li>• Manhattan memiliki rata-rata harga tertinggi</li>
                  <li>• Staten Island memiliki listing paling sedikit</li>
                </ul>
                
                <h3 className="font-semibold text-lg">Pola Harga</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Mayoritas listing berada di rentang $51-200 per malam</li>
                  <li>• Terdapat segmen premium dengan harga $500+ per malam</li>
                  <li>• Distribusi harga menunjukkan right-skewed distribution</li>
                </ul>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Tipe Properti</h3>
                <ul className="space-y-2 text-sm">
                  <li>• "Entire home/apt" dan "Private room" adalah tipe paling populer</li>
                  <li>• "Shared room" memiliki porsi terkecil</li>
                  <li>• Diversifikasi tipe menunjukkan berbagai kebutuhan wisatawan</li>
                </ul>
                
                <h3 className="font-semibold text-lg">Aktivitas dan Ketersediaan</h3>
                <ul className="space-y-2 text-sm">
                  <li>• Mayoritas listing memiliki review rendah (0-10 reviews)</li>
                  <li>• Banyak listing dengan ketersediaan terbatas (0-90 hari)</li>
                  <li>• Menunjukkan pasar yang kompetitif dengan turnover tinggi</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AirbnbDashboard;