import { FC, useState, useEffect } from 'react';
import Filter from '../../components/Filter';
import ProposalsItem from './ProposalsItem';
import { getRecipientById, Recipient } from '../../services/api/governance';
import {
  useRecipients,
  useDonations,
  useRecipientFilters,
  useDonationFilters,
  ExtendedRecipient,
  useAllRecipientsWithPagination,
  useAllDonationsWithPagination,
} from '../../hooks/governance';

import Pagination from './Pagination';
import RecipientPopup from './RecipientPopup';
import ProposalPopup from './ProposalPopup';
import VotePopup from './VotePopup';
import TabButtons from './TabButtons';
import ArrowIcon from './ArrowIcon';
import MyRecipientItem from './MyRecipientItem';
import AllRecipientItem from './AllRecipientItem';
import { recipientCategoryOptions } from '../../services/type';
import EmptyState from './EmptyState';
import { useGoodBalance } from '../../hooks/balance';

interface GovernancePageProps {}

//tab
const recipientTab = [
  { key: 'myRecipient', label: 'My Recipient' },
  { key: 'allRecipients', label: 'All Recipients' },
];
const proposalTab = [
  { key: 'myProposal', label: 'My Proposal' },
  { key: 'allProposals', label: 'All Proposals' },
];
// 筛选器选项
const recipientTypeOptions = [
  'All',
  'Certified Organization',
  'Non-certified Organization',
  'Individual',
];
const statusOptions = ['All', 'Active', 'In Review', 'Draft (Incomplete info)'];
const proposalStatusOptions = [
  'All',
  'Voting',
  'Donated',
  'Expired',
  'To be Donated',
];

const GovernancePage: FC<GovernancePageProps> = () => {
  // 获取GOOD代币余额
  const { goodBalance } = useGoodBalance();

  // 检查GOOD余额是否足够（至少需要10个GOOD）
  const isGoodBalanceSufficient = parseInt(goodBalance || '0') >= 10;

  // 添加一个key来强制MyRecipientItem重新渲染
  const [refreshKey, setRefreshKey] = useState(0);

  const [activeTabProposal, setActiveTabProposal] = useState<
    'myProposal' | 'allProposals'
  >('myProposal');
  const [activeTabRecipient, setActiveTabRecipient] = useState<
    'myRecipient' | 'allRecipients'
  >('myRecipient');

  // 添加弹窗状态
  const [showRecipientPopup, setShowRecipientPopup] = useState<boolean>(false);
  const [showProposalPopup, setShowProposalPopup] = useState<boolean>(false);
  const [showVotePopup, setShowVotePopup] = useState<boolean>(false);
  const [selectedDonationId, setSelectedDonationId] = useState<string>('');

  // 添加分页状态
  const [currentRecipientPage, setCurrentRecipientPage] = useState<number>(1);
  const [currentProposalPage, setCurrentProposalPage] = useState<number>(1);

  // 添加编辑相关状态
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [editingRecipient, setEditingRecipient] = useState<
    Recipient | undefined
  >();

  const [currentDonation, setCurrentDonation] = useState<any>(null);

  const RECEIVERS_MY_PER_PAGE = 3;
  const RECEIVERS_ALL_PER_PAGE = 5;
  const DONATIONS_PER_PAGE = 10;

  // 使用自定义 hooks
  const { myReceivers, fetchReceiversData } = useRecipients(activeTabRecipient);

  // donation filters must be initialized before using useDonations with search

  const {
    myRecipientStatus,
    setMyRecipientStatus,
    allRecipientType,
    setAllRecipientType,
    allRecipientCategory,
    setAllRecipientCategory,
    recipientSearchKeyword,
    setRecipientSearchKeyword,
    getFilteredReceivers,
    getFilteredAllReceivers,
  } = useRecipientFilters();
  const {
    proposalSearchKeyword,
    setProposalSearchKeyword,
    proposalRecipientType,
    setProposalRecipientType,
    proposalStatus,
    setProposalStatus,
    timeSortOrder,
    setTimeSortOrder,
    getFilteredDonations,
  } = useDonationFilters();

  const {
    myDonations,
    totalDonations,
    donationRecipientMap,
    fetchDonationsData,
  } = useDonations(
    activeTabProposal,
    currentProposalPage,
    DONATIONS_PER_PAGE,
    proposalSearchKeyword,
    activeTabProposal === 'myProposal'
  );

  // 为All Recipients使用服务器端分页 - 只在activeTabRecipient为'allRecipients'时才调用
  const shouldFetchAllRecipients = activeTabRecipient === 'allRecipients';
  const allRecipientsData = useAllRecipientsWithPagination(
    currentRecipientPage,
    RECEIVERS_ALL_PER_PAGE,
    recipientSearchKeyword,
    allRecipientType !== 'All'
      ? allRecipientType === 'Certified Organization' ||
        allRecipientType === 'Non-certified Organization'
        ? 'Organization'
        : 'Individual'
      : undefined,
    allRecipientCategory !== 'All' ? allRecipientCategory : undefined,
    shouldFetchAllRecipients
  );

  // 为All Proposals使用服务器端分页 - 只在activeTabProposal为'allProposals'时才调用
  const shouldFetchAllProposals = activeTabProposal === 'allProposals';
  const allDonationsData = useAllDonationsWithPagination(
    currentProposalPage,
    DONATIONS_PER_PAGE,
    proposalSearchKeyword,
    proposalRecipientType !== 'All'
      ? proposalRecipientType === 'Certified Organization' ||
        proposalRecipientType === 'Non-certified Organization'
        ? 'Organization'
        : 'Individual'
      : undefined,
    proposalStatus !== 'All' ? proposalStatus : undefined,
    shouldFetchAllProposals
  );

  // 添加防抖搜索词的引用，用于重置分页逻辑
  const [previousDebouncedSearch, setPreviousDebouncedSearch] = useState(
    recipientSearchKeyword
  );
  const [previousDebouncedProposalSearch, setPreviousDebouncedProposalSearch] =
    useState(proposalSearchKeyword);

  // 当防抖后的搜索词发生变化时，重置分页到第一页
  useEffect(() => {
    if (activeTabRecipient === 'allRecipients') {
      // 延迟一点时间，确保防抖已经生效
      const timer = setTimeout(() => {
        if (recipientSearchKeyword !== previousDebouncedSearch) {
          setCurrentRecipientPage(1);
          setPreviousDebouncedSearch(recipientSearchKeyword);
        }
      }, 1100); // 稍微延迟超过防抖时间

      return () => clearTimeout(timer);
    }
  }, [recipientSearchKeyword, activeTabRecipient, previousDebouncedSearch]);

  // 当防抖后的proposals搜索词发生变化时，重置分页到第一页
  useEffect(() => {
    if (activeTabProposal === 'allProposals') {
      const timer = setTimeout(() => {
        if (proposalSearchKeyword !== previousDebouncedProposalSearch) {
          setCurrentProposalPage(1);
          setPreviousDebouncedProposalSearch(proposalSearchKeyword);
        }
      }, 1100);

      return () => clearTimeout(timer);
    }
  }, [
    proposalSearchKeyword,
    activeTabProposal,
    previousDebouncedProposalSearch,
  ]);

  // 当tab切换或搜索条件变化时重置分页
  useEffect(() => {
    setCurrentRecipientPage(1);
  }, [
    activeTabRecipient,
    recipientSearchKeyword,
    myRecipientStatus,
    allRecipientType,
    allRecipientCategory,
  ]);

  useEffect(() => {
    setCurrentProposalPage(1);
  }, [
    activeTabProposal,
    proposalSearchKeyword,
    proposalRecipientType,
    proposalStatus,
    timeSortOrder,
  ]);

  // 获取当前页的受助者数据
  const getPaginatedReceivers = (data: any) => {
    const filteredData =
      activeTabRecipient === 'myRecipient'
        ? getFilteredReceivers(data)
        : getFilteredAllReceivers(data);

    const itemsPerPage =
      activeTabRecipient === 'myRecipient'
        ? RECEIVERS_MY_PER_PAGE
        : RECEIVERS_ALL_PER_PAGE;

    const startIndex = (currentRecipientPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return {
      ...filteredData,
      backend: filteredData.backend.slice(startIndex, endIndex),
    };
  };

  // 处理编辑recipient
  const handleEditRecipient = async (recipient: ExtendedRecipient) => {
    try {
      // 如果是Draft数据，直接使用当前数据
      if (recipient.isDraft) {
        setEditingRecipient(recipient as Recipient);
        setEditMode('edit');
        setShowRecipientPopup(true);
        return;
      }

      // 如果是Draft状态且可编辑，直接使用当前数据
      if (recipient.isIncomplete && recipient.canEdit) {
        setEditingRecipient(recipient as Recipient);
        setEditMode('edit');
        setShowRecipientPopup(true);
        return;
      }

      // 对于完整的数据，通过API获取最新信息
      const fullRecipient = await getRecipientById(recipient.id);
      setEditingRecipient(fullRecipient);
      setEditMode('edit');
      setShowRecipientPopup(true);
    } catch (error) {
      console.error(error);
      // 如果API失败但是是可编辑的Draft，使用当前数据
      if (recipient.isIncomplete && recipient.canEdit) {
        setEditingRecipient(recipient as Recipient);
        setEditMode('edit');
        setShowRecipientPopup(true);
      }
    }
  };

  // 处理创建新recipient
  const handleCreateRecipient = () => {
    setEditingRecipient(undefined);
    setEditMode('create');
    setShowRecipientPopup(true);
  };

  // 关闭弹窗时重置编辑状态
  const handleCloseRecipientPopup = (visible: boolean) => {
    setShowRecipientPopup(visible);
    if (!visible) {
      setEditMode('create');
      setEditingRecipient(undefined);
      // 刷新数据
      fetchReceiversData();
      // 强制MyRecipientItem重新渲染以显示最新的draft数据
      setRefreshKey((prev) => prev + 1);
    }
  };

  // 处理vote按钮点击
  const handleVoteClick = (donationId: string) => {
    setSelectedDonationId(donationId);
    setShowVotePopup(true);
    setCurrentDonation(
      myDonations.find((donation) => donation.id === donationId)
    );
  };

  // 处理时间排序点击
  const handleTimeSortClick = () => {
    if (timeSortOrder === null) {
      setTimeSortOrder('desc'); // 首次点击：降序
    } else if (timeSortOrder === 'desc') {
      setTimeSortOrder('asc'); // 第二次点击：升序
    } else {
      setTimeSortOrder(null); // 第三次点击：取消排序
    }
  };

  return (
    <div className="flex flex-col items-center justify-center bg-mainV1">
      <RecipientPopup
        visible={showRecipientPopup}
        setVisible={handleCloseRecipientPopup}
        mode={editMode}
        recipientData={editingRecipient}
      />
      <ProposalPopup
        visible={showProposalPopup}
        setVisible={setShowProposalPopup}
        onSuccess={fetchDonationsData}
      />
      <VotePopup
        currentDonation={currentDonation}
        donationId={selectedDonationId}
        visible={showVotePopup}
        setVisible={setShowVotePopup}
        onSuccess={fetchDonationsData}
      />
      <section className="mt-20 inline-flex items-start justify-center gap-4 max-sm:mt-[30px] max-sm:flex-col">
        <div className="inline-flex flex-col items-center justify-center gap-5 max-sm:gap-1">
          <div className="inline-flex items-end justify-start gap-10 text-2xl font-bold text-white max-sm:text-lg">
            Create Donation Recipient
          </div>
          <div className="flex flex-col items-start justify-start gap-2.5 max-sm:gap-1">
            <button
              className={`flex h-16 w-[542px] flex-col items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-xl text-white max-sm:h-[30px] max-sm:w-[300px] max-sm:rounded-[6px] max-sm:text-xs ${
                isGoodBalanceSufficient
                  ? 'cursor-pointer bg-amber-500'
                  : 'cursor-not-allowed bg-gray-400 opacity-50'
              }`}
              onClick={
                isGoodBalanceSufficient ? handleCreateRecipient : undefined
              }
              disabled={!isGoodBalanceSufficient}
            >
              Create Now
            </button>
          </div>
        </div>
        <div className="inline-flex flex-col items-center justify-center gap-5 max-sm:gap-1">
          <div className="inline-flex items-end justify-start gap-10 text-2xl font-bold text-white max-sm:text-lg">
            Create Donation Proposal
          </div>
          <div className="flex flex-col items-start justify-start gap-2.5 max-sm:gap-1">
            <button
              className={`flex h-16 w-[542px] flex-col items-center justify-center gap-2.5 rounded-2xl px-5 py-4 text-xl text-white max-sm:h-[30px] max-sm:w-[300px] max-sm:rounded-[6px] max-sm:text-xs ${
                isGoodBalanceSufficient
                  ? 'cursor-pointer bg-amber-500'
                  : 'cursor-not-allowed bg-gray-400 opacity-50'
              }`}
              onClick={
                isGoodBalanceSufficient
                  ? () => setShowProposalPopup(true)
                  : undefined
              }
              disabled={!isGoodBalanceSufficient}
            >
              Propose Now
            </button>
          </div>
        </div>
      </section>

      {/* recipient */}
      <section className="items-center justify-center max-sm:flex max-sm:flex-col">
        <div className="mt-20 flex w-[1100px] flex-col items-center max-sm:mt-9 max-sm:w-[350px]">
          <TabButtons
            activeTab={activeTabRecipient}
            setActiveTab={setActiveTabRecipient}
            tabs={recipientTab}
          />
        </div>

        {(activeTabRecipient === 'myRecipient' && myReceivers.total > 0) ||
        activeTabRecipient === 'allRecipients' ? (
          <section className="mt-4 w-full">
            {
              <div className="mb-4 mt-10 flex w-full flex-wrap justify-end gap-4 max-sm:mb-1 max-sm:mt-0 max-sm:items-center max-sm:gap-[6px]">
                <div className="flex h-12 w-[400px] items-center rounded-lg border border-gray-200 bg-white px-4 max-sm:h-5 max-sm:w-[149px] max-sm:rounded-[2px] max-sm:px-0 placeholder:max-sm:text-[10px]">
                  <div className="flex w-full items-center gap-2 max-sm:gap-1">
                    <i className="iconfont icon-magnifier_RandSwap text-lg text-gray-400 max-sm:ml-1 max-sm:text-[8px]" />

                    <input
                      type="text"
                      placeholder="Search Donation Recipient"
                      className="flex-1 bg-transparent text-base font-normal text-[#202020] outline-none max-sm:h-5 max-sm:text-[10px] placeholder:max-sm:text-[10px]"
                      value={recipientSearchKeyword}
                      onChange={(e) =>
                        setRecipientSearchKeyword(e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* 筛选器 */}
                {activeTabRecipient === 'myRecipient' ? (
                  <Filter
                    label="Status"
                    placeholder="Status"
                    options={statusOptions}
                    value={myRecipientStatus}
                    onChange={setMyRecipientStatus}
                  />
                ) : (
                  <div className="w-auto space-x-4 leading-none max-sm:space-x-[6px]">
                    <Filter
                      label="Type"
                      placeholder="Type"
                      options={recipientTypeOptions}
                      value={allRecipientType}
                      onChange={setAllRecipientType}
                    />
                    <Filter
                      label="Category"
                      placeholder="Category"
                      options={recipientCategoryOptions}
                      value={allRecipientCategory}
                      onChange={setAllRecipientCategory}
                    />
                  </div>
                )}
              </div>
            }
            {activeTabRecipient === 'myRecipient' ? (
              <MyRecipientItem
                key={refreshKey}
                data={getPaginatedReceivers(myReceivers)}
                onEdit={handleEditRecipient}
              />
            ) : (
              <AllRecipientItem
                data={{
                  blockchain: [],
                  backend: allRecipientsData.data.recipients.map(
                    (recipient) => ({
                      ...recipient,
                      isIncomplete: false,
                      canEdit: false,
                      isDraft: false,
                    })
                  ),
                  drafts: [],
                  total: allRecipientsData.data.total,
                  page: allRecipientsData.data.page,
                  limit: allRecipientsData.data.limit,
                  totalPages: allRecipientsData.data.totalPages,
                }}
              />
            )}
            <div className="mt-6">
              <Pagination
                currentPage={currentRecipientPage}
                totalItems={
                  activeTabRecipient === 'myRecipient'
                    ? getFilteredReceivers(myReceivers).total
                    : allRecipientsData.data.total
                }
                itemsPerPage={
                  activeTabRecipient === 'myRecipient'
                    ? RECEIVERS_MY_PER_PAGE
                    : RECEIVERS_ALL_PER_PAGE
                }
                onPageChange={setCurrentRecipientPage}
              />
            </div>
          </section>
        ) : (
          <div className="mt-4">
            <EmptyState />
          </div>
        )}
      </section>

      {/* proposal */}
      <section>
        <section className="mt-20 flex w-[1100px] flex-col items-center max-sm:mt-9 max-sm:w-[350px]">
          <TabButtons
            activeTab={activeTabProposal}
            setActiveTab={setActiveTabProposal}
            tabs={proposalTab}
          />
        </section>

        <section className="mt-4">
          <div className="mb-4 flex w-full flex-wrap justify-end gap-4 max-sm:mb-1 max-sm:items-center max-sm:gap-[6px]">
            <div className="flex h-12 w-[400px] items-center rounded-lg border border-gray-200 bg-white px-4 max-sm:h-5 max-sm:w-[115px] max-sm:rounded-[2px] max-sm:px-0 placeholder:max-sm:text-[10px]">
              <div className="flex w-full items-center gap-2 max-sm:gap-1">
                <i className="iconfont icon-magnifier_RandSwap text-lg text-gray-400 max-sm:ml-1 max-sm:text-[8px]" />

                <input
                  type="text"
                  placeholder="Donation Recipient"
                  className="flex-1 bg-transparent text-base font-normal text-[#202020] outline-none max-sm:h-5 max-sm:text-[10px] placeholder:max-sm:text-[10px]"
                  value={proposalSearchKeyword}
                  onChange={(e) => setProposalSearchKeyword(e.target.value)}
                />
              </div>
            </div>

            {/* 筛选器 */}

            <Filter
              label="Type"
              placeholder="Type"
              options={recipientTypeOptions}
              value={proposalRecipientType}
              onChange={(value) => setProposalRecipientType(value)}
            />

            <Filter
              label=" Status"
              placeholder="Status"
              options={proposalStatusOptions}
              value={proposalStatus}
              onChange={(value) => setProposalStatus(value)}
            />

            {/* 时间 */}
            <div className="flex items-center">
              <span
                className={`mr-2.5 font-normal text-white max-sm:mr-1 max-sm:text-[10px]`}
              >
                Time
              </span>
              <span
                className="mr-1.5 flex cursor-pointer flex-col items-center max-sm:mr-0 sm:mr-3.5"
                onClick={handleTimeSortClick}
              >
                <ArrowIcon
                  enable={timeSortOrder === 'asc'}
                  className="-mb-1.5 mr-[1px]"
                />
                <ArrowIcon
                  enable={timeSortOrder === 'desc'}
                  className="ml-[1px] origin-center rotate-180 max-sm:mr-[1px] max-sm:mt-2"
                />
              </span>
            </div>
          </div>
          <ProposalsItem
            isCharity={true}
            data={
              activeTabProposal === 'myProposal'
                ? getFilteredDonations(myDonations, donationRecipientMap)
                : allDonationsData.data.donations
            }
            onVoteClick={handleVoteClick}
            recipientMap={donationRecipientMap}
          />
          <div className="mt-6">
            <Pagination
              currentPage={currentProposalPage}
              totalItems={
                activeTabProposal === 'myProposal'
                  ? totalDonations
                  : allDonationsData.data.total
              }
              itemsPerPage={DONATIONS_PER_PAGE}
              onPageChange={setCurrentProposalPage}
            />
          </div>
        </section>
      </section>

      {/* <section className="mt-20 max-sm:mt-[30px]">
        <div className="justify-start text-center text-2xl font-bold text-white max-sm:text-lg">
          Charity Governance
        </div>
        <div className="mt-10 w-[1100px] rounded-2xl border-2 bg-white p-4 text-base font-normal text-[#666] max-sm:mt-3 max-sm:w-[350px] max-sm:text-xs max-sm:leading-4 md:p-10 md:text-[20px] md:leading-[42px]">
          <h1 className="font-bold">Proposal</h1>
          <div className="mt-[10px]">
            <ul className="list-disc pl-5">
              <li>
                Proposal rights require a minimum of{' '}
                <span className="md:font-bold">1,000</span> current EXP
                holdings.
              </li>
              <li>
                Proposals will be reviewed after submission and may be rejected
                for reasons including but not limited to:
                <ul className="list-disc pl-5">
                  <li>
                    <span className="md:font-bold">
                      Duplicate or Similar Proposal Exists:
                    </span>
                    A similar or identical donation proposal has already been
                    approved or is currently being executed.
                  </li>
                  <li>
                    <span className="md:font-bold">
                      Unclear Proposal Objectives:
                    </span>{' '}
                    The proposal does not clearly state the purpose or goals of
                    the donation.
                  </li>
                  <li>
                    <span className="md:font-bold">
                      Incorrect/Incomplete Proposal Information:
                    </span>
                    <ul className="list-disc pl-5">
                      <li>Incorrect or incomplete proposal information.</li>
                      <li>Lacks detailed information about the beneficiary.</li>
                    </ul>
                  </li>
                  <li>
                    <span className="md:font-bold">
                      Beneficiary Does Not Meet Eligibility Criteria:
                    </span>{' '}
                    The beneficiary is not a legitimate organization or lacks
                    verifiable details.
                  </li>
                  <li>
                    <span className="md:font-bold">
                      Controversial Beneficiary:
                    </span>{' '}
                    The beneficiary is controversial due to political,
                    religious, or ethical concerns.
                  </li>
                  <li>
                    <span className="md:font-bold">
                      Significant Community Opposition:
                    </span>{' '}
                    There is significant opposition or skepticism from the
                    community regarding the proposal.
                  </li>
                </ul>
              </li>
            </ul>
          </div>

          <h1 className="mt-6 font-bold max-sm:mt-2">Voting</h1>
          <div className="mt-[10px]">
            <ul className="list-disc pl-5">
              <li>
                Voting Token: EXP. The EXP used for voting will be locked.
              </li>
              <li>
                Voting rights require a minimum of
                <span className="md:font-bold">1,000</span> current EXP
                holdings.
              </li>
              <li>
                Voting allows to use with a fixed percentage of the current EXP
                holdings.
              </li>
              <li>
                Donation Execution Condition: Donation is executed if For votes
                ≥m% of Against votes.
              </li>
            </ul>
          </div>

          <h1 className="mt-6 font-bold max-sm:mt-2">GOOD Reward</h1>
          <div className="mt-[10px]">
            <ul className="list-disc pl-5">
              <li>
                Reward Distribution: If a proposal leads to a donation, all EXP
                voters will receive GOOD rewards based on their voting weight.
              </li>
              <li>
                Weight & GOOD Reward Formula:
                <ul className="list-disc pl-5 md:font-bold">
                  <li>
                    GOOD Amount = (EXP Voting Amount / Total EXP Voting Amount)
                    × Total Reward Pool Amount.
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default GovernancePage;
