library(tidyverse)
library(lsr)
library(ggpubr)
library(ez)
library(pwr)
library(psych)
library(gridExtra)
library(gtools)
library(ggplot2)
library(ggbeeswarm)
library(BayesFactor)
library(svMisc)
rm(list = ls())

# Joan Danielle K. Ongchoco
# This code analyzes data for the Headings experiments.
# CleanData, Exclusions, GetKeyDiff, PlotData, Statistics, Save

######################################################################
# CLEAN DATA

# Load files
filenames = list.files(pattern=".csv")
ad = do.call("smartbind",lapply(filenames,read.csv,header=TRUE))

# Get all subjects
ad$subj_id = as.character(ad$subj_id)
included_subjects = unique(ad$subj_id[ad$test_part=='debrief'])

# Get debriefing responses
codes = ad %>% filter(test_part == 'debrief') %>% dplyr::select(subj_id, time_elapsed, resp_attention, resp_final, completion_code)
codes$time_elapsed = codes$time_elapsed/1000/60
median(codes$time_elapsed)

# Get relevant data
test_data = ad %>% filter(test_part=='test_trial') %>%
  select(subj_id, expt_condition, total_reading_time, total_scrolls, num_scrolls_up,
         scroll_type, scroll_time, scroll_duration, scroll_depth, onscreen_at_scroll,
         clicked_typo_locations, clicked_typo_times, num_typos_found)

# Format relevant data
test_data$scroll_type = as.character(test_data$scroll_type)
test_data$scroll_time = as.character(test_data$scroll_time)
test_data$scroll_depth = as.character(test_data$scroll_depth)
test_data$scroll_duration = as.character(test_data$scroll_duration)
test_data$onscreen_at_scroll = as.character(test_data$onscreen_at_scroll)
test_data$clicked_typo_locations = as.character(test_data$clicked_typo_locations)
test_data$clicked_typo_times = as.character(test_data$clicked_typo_times)
test_data$num_typos_found = as.character(test_data$num_typos_found)

test_data$scroll_type = strsplit(test_data$scroll_type, ',')
test_data$scroll_time = strsplit(test_data$scroll_time, ',')
test_data$scroll_depth = strsplit(test_data$scroll_depth, ',')
test_data$scroll_duration = strsplit(test_data$scroll_duration, ',')
test_data$onscreen_at_scroll = strsplit(test_data$onscreen_at_scroll, ',')
test_data$clicked_typo_locations = strsplit(test_data$clicked_typo_locations, ',')
test_data$clicked_typo_times = strsplit(test_data$clicked_typo_times, ',')
test_data$num_typos_found = strsplit(test_data$num_typos_found, ',')

# Transpose data from rows to columns
test_data_t = data.frame()
test_data_c = data.frame()
for (i in 1:nrow(test_data)){
  sub = test_data$subj_id[i]
  expt_condition = test_data$expt_condition[i]
  sub_data = test_data %>% filter(subj_id == sub)
  sub_data_t = data.frame(unlist(sub_data$scroll_type), 
                          unlist(sub_data$scroll_time),
                          unlist(sub_data$scroll_depth),
                          unlist(sub_data$scroll_duration),
                          unlist(sub_data$onscreen_at_scroll))
  sub_data_t$subj_id = sub
  sub_data_t$expt_condition = expt_condition
  colnames(sub_data_t) = c("scroll_type", "scroll_time", "scroll_depth", "scroll_duration", "onscreen_at_scroll", "subj_id", "expt_condition")
  
  sub_data_t$scroll_time = as.numeric(as.character(sub_data_t$scroll_time))
  sub_data_t$scroll_depth = as.numeric(as.character(sub_data_t$scroll_depth))
  sub_data_t$scroll_duration = as.numeric(as.character(sub_data_t$scroll_duration))
  
  sub_data_t$scroll_time_norm = sub_data_t$scroll_time/sub_data_t$scroll_time[nrow(sub_data_t)]
  
  test_data_t = rbind(test_data_t, sub_data_t)
  
  sub_data_c = data.frame(unlist(sub_data$clicked_typo_locations), 
                          unlist(sub_data$clicked_typo_times))
  sub_data_c$subj_id = sub
  sub_data_c$expt_condition = expt_condition
  colnames(sub_data_c) = c("clicked_typo_locations", "clicked_typo_times", "subj_id", "expt_condition")
  
  test_data_c = rbind(test_data_c, sub_data_c)
}

for (i in 1:nrow(test_data_t)){
  test_data_t$is_heading[i] = grepl("(h", test_data_t$onscreen_at_scroll[i], fixed=TRUE)
}

######################################################################
# EXCLUSIONS

# Subj. Level Exclusions (Attn)
# attn_level = 80
# rm_attn = sum(codes$resp_attention < attn_level)
# included_data = codes %>% filter(resp_attention >= attn_level)
# included_subjects = unique(included_data$subj_id)
# ad = ad %>% filter(subj_id %in% included_subjects)
# for (i in 1:nrow(codes)){
#   filename=codes$subj_id[i]
#   if (codes$resp_attention[i] < attn_level){
#     file.copy(from = paste0(loc, filename, ".csv", sep=""),
#               to   = paste0(loc, "rm_attn/", sep=""))
#     file.remove(paste0(loc, filename, ".csv", sep=""))
#   }
# }

# Trial Level Exclusion (RTs)
# sd_num = 2.5
# threshold_data = test_data %>% group_by(subj_id) %>% 
#   summarize(mean_rt = mean(response_time), sd_rt = sd(response_time))
# threshold_data$low = threshold_data$mean_rt - sd_num*threshold_data$sd_rt
# threshold_data$high = threshold_data$mean_rt + sd_num*threshold_data$sd_rt
# for (i in 1:nrow(test_data)){
#   subj_id = test_data$subj_id[i]
#   test_data$exclude_up[i] = test_data$response_time[i] > threshold_data$high[threshold_data$subj_id==subj_id]
#   test_data$exclude_low[i] = test_data$response_time[i] < threshold_data$low[threshold_data$subj_id==subj_id]
#   progress(i, nrow(test_data))
# }
# rm_rt = sum(ad$exclude_up==TRUE) + sum(ad$exclude_low==TRUE)
# ad = ad %>% filter(exclude_up==FALSE, exclude_low==FALSE)

######################################################################
# PLOT

# Plot depth vs. time
test_data_t %>% 
  group_by(expt_condition, subj_id) %>% summarize(scroll_depth=scroll_depth, scroll_time=scroll_time_norm) %>%
  ggplot(aes(x=scroll_time, y=scroll_depth, group=expt_condition, color=expt_condition)) +
  geom_point(size=3) + geom_line(size=1) +
  scale_y_continuous(expand = c(0, 0)) +
  scale_fill_manual(values=c("#6667AB", "#b5c7d3")) +
  theme_test() + 
  facet_wrap(~subj_id) +
  theme(aspect.ratio=0.5, 
        legend.title=element_blank(), 
        legend.position="bottom", 
        axis.ticks = element_blank(),
        axis.title.x=element_text(face="bold"), 
        axis.title.y=element_text(face="bold"), 
        text=element_text(size=16, family="Helvetica"))

# Plot depth vs. duration
test_data_t %>% filter(scroll_duration > 0) %>% ggplot(aes(x=scroll_depth, y=scroll_duration, group=expt_condition, color=expt_condition)) +
  geom_line(size=1) +
  scale_y_continuous(expand = c(0, 0)) + #limits = c(0, 20)
  scale_fill_manual(values=c("#6667AB", "#b5c7d3")) +
  theme_test() + 
  facet_wrap(~subj_id) +
  theme(aspect.ratio=0.5, 
        legend.title=element_blank(), 
        legend.position="bottom", 
        axis.ticks = element_blank(),
        axis.title.x=element_text(face="bold"), 
        axis.title.y=element_text(face="bold"), 
        text=element_text(size=16, family="Helvetica"))

# Plot depth vs. duration
test_data_t %>% ggplot(aes(x=scroll_time, y=scroll_type, group=expt_condition, color=expt_condition)) +
  geom_line(size=1) +
  #scale_y_continuous(expand = c(0, 0)) + #limits = c(0, 20)
  scale_fill_manual(values=c("#6667AB", "#b5c7d3")) +
  theme_test() + 
  facet_wrap(~subj_id) +
  theme(aspect.ratio=0.5, 
        legend.title=element_blank(), 
        legend.position="bottom", 
        axis.ticks = element_blank(),
        axis.title.x=element_text(face="bold"), 
        axis.title.y=element_text(face="bold"), 
        text=element_text(size=16, family="Helvetica"))

# Plot error detection
test_data_c %>% ggplot(aes(num_typos_found)) + 
  geom_histogram(stat="count") + 
  facet_wrap(~expt_condition) + 
  theme_test() +
  facet_wrap(~subj_id) +
  theme(aspect.ratio=0.5, 
        legend.title=element_blank(), 
        legend.position="bottom", 
        axis.ticks = element_blank(),
        axis.title.x=element_text(face="bold"), 
        axis.title.y=element_text(face="bold"), 
        text=element_text(size=16, family="Helvetica"))

