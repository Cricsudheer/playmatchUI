import React, { useMemo, useState } from 'react';
import { usePlayerStats } from '../hooks/usePlayerStats';
import { calculateStats } from '../utils/statsCalculations';
import { classNames } from '../utils/classNameUtils';
import { TABS, BATTING_SORT_OPTIONS, BOWLING_SORT_OPTIONS } from '../constants/config';
import { Header } from '../components/Header';
import { HighlightsSection } from '../components/HighlightsSection';
import { TabNavigation } from '../components/TabNavigation';
import { OverviewTable } from '../components/OverviewTable';
import { BattingTable } from '../components/BattingTable';
import { BowlingTable } from '../components/BowlingTable';
import { FieldingTable } from '../components/FieldingTable';
import { InsightsPanel } from '../components/InsightsPanel';
import { AwardsBanner } from '../components/AwardsBanner';

/**
 * Dashboard Page Component
 * Main dashboard showing player statistics and highlights
 */
export function DashboardPage({ onNavigateToAwards }) {
  const { players, loading, error } = usePlayerStats();
  const [activeTab, setActiveTab] = useState(TABS.OVERVIEW);
  const [batSortBy, setBatSortBy] = useState(BATTING_SORT_OPTIONS.RUNS);
  const [batMinInns, setBatMinInns] = useState(0);
  const [bowlSortBy, setBowlSortBy] = useState(BOWLING_SORT_OPTIONS.WICKETS);

  const stats = useMemo(() => calculateStats(players), [players]);

  const {
    battingPlayers,
    bowlingPlayers,
    fieldingPlayers,
    totalRuns,
    totalWickets,
    topRunScorer,
    topWicketTaker,
    topKeeper,
  } = stats;

  const squadSize = players.length;

  const renderContent = () => {
    if (loading) {
      return (
        <div className="table-wrapper">
          <div className="loading-overlay">Loading stats from backend…</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="table-wrapper">
          <div className="loading-overlay">{error}</div>
        </div>
      );
    }

    switch (activeTab) {
      case TABS.OVERVIEW:
        return (
          <OverviewTable
            players={players}
            battingPlayers={battingPlayers}
            bowlingPlayers={bowlingPlayers}
            fieldingPlayers={fieldingPlayers}
          />
        );
      case TABS.BATTING:
        return (
          <BattingTable
            battingPlayers={battingPlayers}
            batSortBy={batSortBy}
            setBatSortBy={setBatSortBy}
            batMinInns={batMinInns}
            setBatMinInns={setBatMinInns}
          />
        );
      case TABS.BOWLING:
        return (
          <BowlingTable
            bowlingPlayers={bowlingPlayers}
            bowlSortBy={bowlSortBy}
            setBowlSortBy={setBowlSortBy}
          />
        );
      case TABS.FIELDING:
        return <FieldingTable fieldingPlayers={fieldingPlayers} />;
      default:
        return null;
    }
  };

  const getPanelTitle = () => {
    const titles = {
      [TABS.OVERVIEW]: 'Team Overview',
      [TABS.BATTING]: 'Batting – Core Contributors',
      [TABS.BOWLING]: 'Bowling – Strike Unit',
      [TABS.FIELDING]: 'Fielding & Dismissals',
    };
    return titles[activeTab] || 'Team Overview';
  };

  const getPanelSubtitle = () => {
    const subtitles = {
      [TABS.OVERVIEW]: 'Combined snapshot of batting, bowling & fielding.',
      [TABS.BATTING]:
        'Use min innings & sorting to focus on batters that actually face balls.',
      [TABS.BOWLING]: 'Use wickets / wkts per inn / economy to pick your attack.',
      [TABS.FIELDING]:
        'Who is converting half-chances into wickets in the field.',
    };
    return subtitles[activeTab] || '';
  };

  return (
    <div className="page">
      <AwardsBanner onNavigateToAwards={onNavigateToAwards} />

      <Header squadSize={squadSize} totalRuns={totalRuns} totalWickets={totalWickets} />

      <div className="main-layout">
        <div>
          <HighlightsSection
            topRunScorer={topRunScorer}
            topWicketTaker={topWicketTaker}
            topKeeper={topKeeper}
            totalRuns={totalRuns}
            totalWickets={totalWickets}
          />

          <TabNavigation
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            playerCounts={{
              all: players.length,
              batting: battingPlayers.length,
              bowling: bowlingPlayers.length,
              fielding: fieldingPlayers.length,
            }}
          />

          <div className="panel">
            <div className="panel-header">
              <div>
                <div className="panel-title">{getPanelTitle()}</div>
                <div className="panel-subtitle">{getPanelSubtitle()}</div>
              </div>
            </div>

            {renderContent()}
          </div>
        </div>

        <InsightsPanel
          players={players}
          topRunScorer={topRunScorer}
          topWicketTaker={topWicketTaker}
          bestEconomy={stats.bestEconomy}
          topKeeper={topKeeper}
          totalRuns={totalRuns}
          totalWickets={totalWickets}
        />
      </div>
    </div>
  );
}
