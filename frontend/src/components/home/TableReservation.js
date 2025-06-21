import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiMapPin,
  FiClock,
  FiInfo,
  FiStar,
  FiTarget,
  FiShoppingCart,
  FiEye
} from "react-icons/fi";
import { tableRecommendationService, tableUtils } from "../../services/tableRecommendationService";

const TableReservation = () => {
  const [tables, setTables] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredTable, setHoveredTable] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuthStatus();
    fetchTables();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  };

  const fetchTables = async () => {
    try {
      const tablesResponse = await axios.get("http://localhost:8080/api/tables");
      if (tablesResponse.data && tablesResponse.data.length > 0) {
        const regularTables = tablesResponse.data.slice(0, 3);
        setTables(regularTables);

        const featuredTables = regularTables.map((table) => ({
          ...table,
          isRecommendation: false
        }));
        setRecommendations(featuredTables);
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      setError("Failed to load tables");
    } finally {
      setLoading(false);
    }
  };

  const recordInteraction = async (tableId, interactionType) => {
    if (!isLoggedIn) return;
    try {
      await tableRecommendationService.recordInteraction({
        tableId,
        interactionType,
        source: "home_page"
      });
    } catch (error) {
      console.error("Error recording interaction:", error);
    }
  };

  const getCurrentTables = () => {
    return recommendations.length > 0
      ? recommendations.slice(0, 3)
      : tables.slice(0, 3);
  };

  const currentTables = getCurrentTables();
  const visibleTables = currentTables;

  if (loading) {
    return (
      <section className="tables-section">
        <div className="container">
          <div className="section-header">
            <h6 className="section-subtitle">Our Tables</h6>
            <h2 className="section-title">Featured Dining Spaces</h2>
          </div>
          <div className="tables-slider">
            <div className="tables-container">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="table-card">
                  <div className="skeleton-loader">
                    <div className="skeleton-image" />
                    <div className="skeleton-content">
                      <div className="skeleton-title" />
                      <div className="skeleton-text" />
                      <div className="skeleton-text" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="tables-section">
        <div className="container">
          <div className="alert alert-warning d-flex align-items-center">
            <FiInfo className="me-2" />
            {error}
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Keep your animated CSS in global or add style tag here if needed */}
      <section style={{
        width: "100%",
        padding: "4rem 0",
        background: "linear-gradient(180deg, #0A192F 0%, #112240 50%, #0A192F 100%)",
        backdropFilter: "blur(10px)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Animated Background (optional, already working) */}

        <div style={{
          width: "100%",
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "0 2rem",
          position: "relative",
          zIndex: 1
        }}>
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h2 style={{
              fontSize: "2.5rem",
              fontWeight: "800",
              background: "linear-gradient(135deg, #ffffff 0%, #bb86fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
              Featured Tables
            </h2>
            <Link
              to="/reserve-table"
              style={{
                display: "inline-block",
                marginTop: "0.5rem",
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, rgba(30, 64, 175, 0.9), rgba(29, 78, 216, 0.8))",
                color: "#fff",
                textDecoration: "none",
                borderRadius: "0.75rem",
                fontWeight: "600"
              }}
            >
              View All Tables
            </Link>
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "1.5rem",
            justifyContent: "center"
          }}>
            {visibleTables.map((table, index) => {
              if (!table || !table._id) return null;

              return (
                <div
                  key={table._id}
                  onMouseEnter={() => {
                    recordInteraction(table._id, "view");
                    setHoveredTable(table._id);
                  }}
                  onMouseLeave={() => setHoveredTable(null)}
                  style={{
                    background: hoveredTable === table._id
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "1rem",
                    padding: "1rem",
                    backdropFilter: "blur(8px)",
                    transition: "all 0.3s ease"
                  }}
                >
                  <img
                    src={tableUtils.getImageUrl(table.image)}
                    alt={table.tableName}
                    style={{
                      width: "100%",
                      height: "160px",
                      objectFit: "cover",
                      borderRadius: "0.75rem"
                    }}
                    onError={(e) => {
                      e.target.src = "/images/placeholder-table.jpg";
                      e.target.onerror = null;
                    }}
                  />
                  <h4 style={{ color: "#fff", marginTop: "1rem" }}>{table.tableName}</h4>
                  <p style={{ color: "#bbb", fontSize: "0.9rem" }}>{table.tableType}</p>
                  <p style={{ color: "#bbb", fontSize: "0.85rem" }}>
                    <FiUsers /> {table.capacity} Seats | <FiMapPin /> {table.location}
                  </p>
                  <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem" }}>
                    <Link
                      to="/reserve-table"
                      onClick={() => recordInteraction(table._id, "inquiry")}
                      style={{
                        flex: 1,
                        backgroundColor: "#bb86fc",
                        color: "#0a0a0a",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.5rem",
                        textDecoration: "none",
                        fontWeight: "600",
                        textAlign: "center"
                      }}
                    >
                      <FiShoppingCart size={14} /> Reserve
                    </Link>
                    <Link
                      to={`/table-details/${table._id}`}
                      style={{
                        padding: "0.5rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #bb86fc",
                        color: "#bb86fc",
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <FiEye />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {currentTables.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "3rem 0",
              color: "rgba(255,255,255,0.7)"
            }}>
              <FiInfo size={48} style={{ marginBottom: "1rem" }} />
              <h3>No tables available</h3>
              <p>Please check back later or try different filters.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default TableReservation;
